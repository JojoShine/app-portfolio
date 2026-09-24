import test from 'node:test';
import assert from 'node:assert/strict';

import { catalogMockApiAdapter } from '../src/features/catalog/mocks/mockApi.js';

const expectedNames = [
  '政策智能匹配', '随手拍', '图书馆服务', '通用答题', '积分商城', '消费券', '招生报名',
  '社区议事',
  '人才服务', '医院服务', '旅游服务', '招聘服务', '线上预约', '宠伴生活',
  '社区闲置交换', '电子证照卡包', '公交实时到站', '城市停车助手', '通用信息填报',
];

test('应用目录只保留可体验应用和当前规划应用', async () => {
  const response = await catalogMockApiAdapter({ method: 'get', url: '/api/app/apps' });
  const applications = response.data.data;

  assert.deepEqual(applications.map(({ name }) => name), expectedNames);
  assert.equal(applications.length, 19);
});

test('可体验应用置顶并按建设时间倒序排列', async () => {
  const response = await catalogMockApiAdapter({ method: 'get', url: '/api/app/apps' });
  const applications = response.data.data;
  const activeApplications = applications.filter(({ status }) => status === 'active');

  assert.deepEqual(activeApplications.map(({ name }) => name), expectedNames.slice(0, 7));
  assert.ok(applications.slice(0, 7).every(({ status }) => status === 'active'));
  assert.ok(applications.slice(7).every(({ status }) => status === 'developing'));
  assert.deepEqual(applications.map(({ sort }) => sort), Array.from({ length: 19 }, (_, index) => index + 1));
});
