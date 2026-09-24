import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyForm, mergeAnalysis, validateForm } from '../src/modules/snap-report/utils/report.js';
import { mockApiAdapter } from '../src/modules/enrollment/mocks/mockApi.js';

test('重新识别保留市民修改，未确认程度与位置不能提交', () => {
  const form = { ...emptyForm(), object: '市民确认的物品', description: '市民填写的描述' };
  const merged = mergeAnalysis(form, { object: 'AI对象', description: 'AI描述', category: '设施损坏' }, new Set(['object', 'description']));
  assert.equal(merged.object, form.object); assert.equal(merged.description, form.description); assert.equal(merged.category, '设施损坏');
  assert.equal(validateForm(merged, [{ id: 'photo' }]).field, 'severity');
  assert.equal(validateForm({ ...merged, severity: '一般', address: '海安市中坝路' }, [{ id: 'photo' }]).field, 'address');
  assert.equal(validateForm({ ...merged, severity: '一般', address: '海安市中坝路', locationConfirmed: true }, [{ id: 'photo' }]), null);
  assert.equal(validateForm({ ...merged, severity: '一般', address: '测试', locationConfirmed: true }, [{ id: 'photo' }]), null);
  assert.equal(validateForm({ ...merged, severity: '一般', address: '   ', locationConfirmed: true }, [{ id: 'photo' }]).field, 'address');
});
test('招生演示适配器不拦截真实身份和私有图片', async () => {
  for (const url of ['/auth/me', '/files/photo-id', '/snap-report/reports']) {
    assert.equal(await mockApiAdapter({ url, method: 'get', headers: { Authorization: 'Bearer real-token' } }), null);
  }
});
