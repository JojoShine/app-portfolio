const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/modules/enrollment/db');
const { issueAccessToken } = require('../src/system/auth').service;
const { encrypt, digest } = require('../src/modules/enrollment/utils/crypto');

test('招生目录接口、个人资料和部门数据由数据库提供且隔离用户', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const userId = `enrollment-data-test-${randomUUID()}`;
  const token = issueAccessToken({ userId, roles: ['parent'] });
  const base = `http://127.0.0.1:${server.address().port}/api/enrollment`;
  const request = async (path, auth = token) => {
    const response = await fetch(`${base}${path}`, { headers: auth ? { Authorization: `Bearer ${auth}` } : {} });
    return { status: response.status, ...(await response.json()) };
  };
  const address = `集成验证路-${randomUUID()}`;
  try {
    assert.equal((await request('/profile', null)).status, 401);
    await db.enrollmentProfile.create({ data: { userId, payloadEncrypted: encrypt({ student: { name: '专属测试学生' } }) } });
    assert.equal((await request('/profile')).data.student.name, '专属测试学生');
    const otherToken = issueAccessToken({ userId: `${userId}-other`, roles: ['parent'] });
    assert.deepEqual((await request('/profile', otherToken)).data, {});
    await db.enrollmentPropertyDegree.create({ data: { address, certificateHash: digest(address), status: 'occupied', year: 2026, stage: 'primary' } });
    assert.equal((await request(`/property-degrees?type=address&keyword=${encodeURIComponent(address)}`)).data.degree.status, 'occupied');
    assert.equal((await request(`/property-degrees?type=address&keyword=${encodeURIComponent(address + '不存在')}`)).data.degree.status, 'unknown');
    assert.equal((await request('/property-degrees?type=invalid&keyword=abcd')).status, 400);
    const studentIdHash = digest(address);
    await db.enrollmentDepartmentRecord.create({ data: { userId, studentIdHash, type: 'household', source: 'test.department', payloadEncrypted: encrypt({ guardian: { name: '测试监护人' } }) } });
    const department = require('../src/modules/enrollment/services/department.service');
    assert.equal((await department.lookup(db, { ownerUserId: userId, studentIdHash }, 'household')).data.guardian.name, '测试监护人');
    assert.equal((await department.lookup(db, { ownerUserId: `${userId}-other`, studentIdHash }, 'household')).status, 'not_found');
    assert.equal((await request('/contacts')).status, 200);
    assert.equal((await request('/districts')).status, 200);
  } finally {
    if (db.enrollmentProfile) await db.enrollmentProfile.deleteMany({ where: { userId } });
    if (db.enrollmentDepartmentRecord) await db.enrollmentDepartmentRecord.deleteMany({ where: { userId } });
    if (db.enrollmentPropertyDegree) await db.enrollmentPropertyDegree.deleteMany({ where: { address } });
    await new Promise((resolve) => server.close(resolve));
  }
});

test('待提交报名可通过删除接口移出用户报名列表', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const userId = `enrollment-delete-test-${randomUUID()}`;
  const token = issueAccessToken({ userId, roles: ['parent'] });
  const base = `http://127.0.0.1:${server.address().port}/api/enrollment`;
  const school = await db.enrollmentSchool.findFirst({ where: { active: true } });
  const studentDocument = `TEST-${randomUUID()}`;
  const application = await db.enrollmentApplication.create({ data: {
    ownerUserId: userId,
    seasonId: school.seasonId,
    schoolId: school.id,
    stage: school.stage,
    category: school.category,
    studentNameEncrypted: encrypt('删除测试学生'),
    studentNameHash: digest('删除测试学生'),
    studentIdEncrypted: encrypt(studentDocument),
    studentIdHash: digest(studentDocument),
    studentIdLastSixHash: digest(studentDocument.slice(-6)),
    payloadEncrypted: encrypt({ student: { name: '删除测试学生', documentNumber: studentDocument } }),
  } });
  try {
    const response = await fetch(`${base}/applications/${application.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.code, 0);
    assert.equal((await db.enrollmentApplication.findUnique({ where: { id: application.id } })).status, 'discarded');
  } finally {
    await db.enrollmentApplication.deleteMany({ where: { id: application.id } });
    await new Promise((resolve) => server.close(resolve));
  }
});
