const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const sharp = require('sharp');
const app = require('../src/app');
const db = require('../src/modules/snap-report/db');
const validation = require('../src/modules/snap-report/validations/report.validation');
const { issueAccessToken } = require('../src/system/auth').service;
const env = require('../src/config/env');
const fileService = require('../src/system/file').service;

test('随手拍允许不含城市名的手填地址，拒绝空地址、重复图片及未确认信息', () => {
  const valid = { fileIds: [crypto.randomUUID()], requestId: crypto.randomUUID(), object: '井盖', category: '设施损坏', severity: '一般', description: '边缘破损', address: '海安市中坝路', detail: '', locationConfirmed: true };
  assert.equal(validation.report(valid).content.object, '井盖');
  assert.throws(() => validation.report({ ...valid, fileIds: [...valid.fileIds, ...valid.fileIds] }), /重复/);
  assert.equal(validation.report({ ...valid, address: ' 测试 ' }).content.address, '测试');
  assert.throws(() => validation.report({ ...valid, address: '   ' }), /发生地址/);
  assert.throws(() => validation.report({ ...valid, severity: '' }), /程度/);
  assert.throws(() => validation.report({ ...valid, locationConfirmed: false }), /确认/);
  assert.throws(() => validation.report({ ...valid, longitude: 'invalid', latitude: 32 }), /坐标/);
  assert.equal(validation.analysisResult({ severity: '不知道', category: '未知' }).severity, '');
});

test('真实上传、识别适配、幂等提交、跨用户隔离及记录刷新', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const userId = `snap-test-${crypto.randomUUID()}`, otherId = `snap-test-${crypto.randomUUID()}`;
  const token = issueAccessToken({ userId, roles: ['citizen'] });
  const other = issueAccessToken({ userId: otherId, roles: ['citizen'] });
  const request = (path, { auth = token, body, method = 'GET' } = {}) => fetch(`${base}${path}`, {
    method, headers: { ...(auth ? { Authorization: `Bearer ${auth}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined,
  });
  const previousAI = [env.SNAP_AI_URL, env.SNAP_AI_KEY, env.SNAP_AI_MODEL];
  const previousMapKey = env.AMAP_REST_KEY;
  const files = [];
  let modelServer;
  try {
    assert.equal((await request('/snap-report/reports', { auth: null })).status, 401);
    const bytes = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#64746c' } }).jpeg().toBuffer();
    const form = new FormData(); form.append('file', new Blob([bytes], { type: 'image/jpeg' }), 'test-photo.jpg');
    const uploaded = await fetch(`${base}/snap-report/photos`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    assert.equal(uploaded.status, 200);
    const file = (await uploaded.json()).data; files.push(file.id);
    assert.equal((await request(`/files/${file.id}`, { auth: other })).status, 403);
    assert.equal((await request(`/files/${file.id}`)).status, 200);
    env.SNAP_AI_URL = '';
    assert.equal((await request('/snap-report/analyses', { method: 'POST', body: { fileIds: files } })).status, 503);
    assert.equal((await request('/snap-report/analyses', { auth: other, method: 'POST', body: { fileIds: files } })).status, 400);
    const express = require('express');
    const model = express(); model.use(express.json({ limit: '3mb' }));
    model.post('/chat', (req, res) => {
      assert.match(req.body.messages[1].content[1].image_url.url, /^data:image\/jpeg;base64,/);
      res.json({ choices: [{ message: { content: JSON.stringify({ object: '井盖', category: '设施损坏', severity: '一般', reason: '边缘有缺口', description: '井盖破损', needsConfirmation: true }) } }] });
    });
    modelServer = model.listen(0, '127.0.0.1'); await new Promise((resolve) => modelServer.once('listening', resolve));
    env.SNAP_AI_URL = `http://127.0.0.1:${modelServer.address().port}/chat`; env.SNAP_AI_KEY = 'test-only'; env.SNAP_AI_MODEL = 'test-model';
    const analyzed = await request('/snap-report/analyses', { method: 'POST', body: { fileIds: files } });
    assert.equal(analyzed.status, 200);
    const analysis = (await analyzed.json()).data;
    assert.equal(analysis.result.object, '井盖');
    // 即使已有坐标，地图服务缺失也不能阻断已确认文字地址的提交。
    env.AMAP_REST_KEY = '';
    const body = { fileIds: files, requestId: crypto.randomUUID(), analysisId: analysis.id, object: '井盖', category: '设施损坏', severity: '一般', reason: '边缘有缺口', description: '市民确认后的描述', address: '海安市中坝路测试点', detail: '测试数据', locationConfirmed: true, longitude: 120.467, latitude: 32.533 };
    const responses = await Promise.all([request('/snap-report/reports', { method: 'POST', body }), request('/snap-report/reports', { method: 'POST', body })]);
    assert.ok(responses.every((response) => response.status === 200));
    const [first, second] = await Promise.all(responses.map((response) => response.json()));
    assert.equal(first.data.id, second.data.id);
    assert.equal((await request('/snap-report/reports', { method: 'POST', body: { ...body, description: '修改内容' } })).status, 409);
    assert.equal((await request(`/snap-report/reports/${first.data.id}`, { auth: other })).status, 404);
    assert.equal((await request(`/snap-report/reports/${first.data.id}`)).status, 200);
    const list = (await (await request('/snap-report/reports')).json()).data;
    assert.equal(list.total, 1); assert.equal(list.items[0].description, body.description);
    const manual = await request('/snap-report/reports', { method: 'POST', body: { ...body, address: '测试', detail: '测试测试', requestId: crypto.randomUUID(), longitude: undefined, latitude: undefined } });
    assert.equal(manual.status, 200, '无坐标的手动地址仍可提交');
    const manualResult = (await manual.json()).data;
    assert.equal(manualResult.longitude, undefined);
    assert.equal(manualResult.address, '测试');
    assert.equal((await db.snapAnalysis.findUnique({ where: { id: analysis.id } })).result.description, '井盖破损');
    assert.equal((await request(`/files/${file.id}`, { method: 'DELETE' })).status, 409);
  } finally {
    [env.SNAP_AI_URL, env.SNAP_AI_KEY, env.SNAP_AI_MODEL] = previousAI;
    env.AMAP_REST_KEY = previousMapKey;
    await db.snapReport.deleteMany({ where: { userId } });
    await db.snapAnalysis.deleteMany({ where: { userId } });
    for (const id of files) await fileService.deleteFile(id, { id: userId });
    if (modelServer) await new Promise((resolve) => modelServer.close(resolve));
    await new Promise((resolve) => server.close(resolve));
  }
});
