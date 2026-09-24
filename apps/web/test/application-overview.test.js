import test from 'node:test';
import assert from 'node:assert/strict';

import * as applicationRegistry from '../src/app/registry/applications.js';

const { applicationModules } = applicationRegistry;

test('每个可运行应用都有完整的体验前说明', () => {
  for (const application of applicationModules) {
    assert.equal(application.overviewPath, `/showcase/${application.id}`);
    assert.ok(application.profile.logo, `${application.id} 缺少应用 logo`);
    assert.ok(application.profile.name, `${application.id} 缺少应用名称`);
    assert.ok(application.profile.businessIntroduction, `${application.id} 缺少业务介绍`);
    assert.ok(application.profile.problemStatement, `${application.id} 缺少问题说明`);
    assert.ok(application.profile.features.length >= 3, `${application.id} 至少需要三项功能说明`);
  }
});

test('体验说明地址与真实应用地址保持分离', () => {
  const paths = applicationModules.map(({ path }) => path);
  const overviewPaths = applicationModules.map(({ overviewPath }) => overviewPath);

  assert.equal(new Set(paths).size, paths.length);
  assert.equal(new Set(overviewPaths).size, overviewPaths.length);
  assert.ok(overviewPaths.every((path) => path?.startsWith('/showcase/')));
});

test('正式站点地址可配置且会清理多余斜杠', () => {
  assert.equal(typeof applicationRegistry.resolveApplicationAddress, 'function');
  assert.deepEqual(applicationRegistry.resolveApplicationAddress('/quiz', {
    publicSiteUrl: 'https://apps.example.com/portfolio/',
    currentOrigin: 'http://localhost:5173',
    basePath: '/app-portfolio/',
  }), {
    displayUrl: 'https://apps.example.com/portfolio/quiz',
    copyUrl: 'https://apps.example.com/portfolio/quiz',
  });
});

test('本地预览隐藏 localhost 但复制地址仍可直接访问', () => {
  assert.equal(typeof applicationRegistry.resolveApplicationAddress, 'function');
  assert.deepEqual(applicationRegistry.resolveApplicationAddress('/enrollment', {
    publicSiteUrl: '',
    currentOrigin: 'http://127.0.0.1:5173',
    basePath: '/',
  }), {
    displayUrl: '/enrollment',
    copyUrl: 'http://127.0.0.1:5173/enrollment',
  });
});
