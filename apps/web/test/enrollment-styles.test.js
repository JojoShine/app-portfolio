import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import postcss from 'postcss';

const base = new URL('../src/modules/enrollment/', import.meta.url);
const read = (path) => readFileSync(new URL(path, base), 'utf8');
const pages = ['home', 'category', 'school-list', 'school-policy', 'preprocess', 'application-overview', 'cluster-edit', 'review-submit', 'submit-success', 'application-list', 'application-detail', 'schedule', 'policies', 'faq', 'district-lookup', 'property-degree', 'guide', 'public-query'];

test('招生所有页面独立维护样式，并使用业务范围内的设计变量', () => {
  assert.match(read('EnrollmentApp.jsx'), /import '\.\/styles\/index\.css'/);
  const entry = read('styles/index.css');
  assert.match(entry, /tokens\.css/);
  assert.match(entry, /shared\.css/);
  assert.match(entry, /pages\.css/);
  assert.doesNotMatch(read('styles/tokens.css'), /:root/);
  assert.match(read('styles/tokens.css'), /\.enrollment-app\s*\{/);
  for (const page of pages) {
    assert.ok(read('styles/pages.css').includes(`@import './pages/${page}.css';`));
    assert.ok(postcss.parse(read(`styles/pages/${page}.css`)).nodes.length > 0);
  }
});

test('招生页面无业务固定宽度上限，移动后的图片路径均有效', () => {
  for (const path of ['styles/shared.css', ...pages.map(page => `styles/pages/${page}.css`)]) {
    const css = postcss.parse(read(path));
    css.walkDecls(decl => {
      if (['width', 'max-width', 'min-width'].includes(decl.prop)) assert.doesNotMatch(decl.value, /(?:430|760)px/);
      for (const [, asset] of decl.value.matchAll(/url\(['"]?(\.\.[^)'"\s]+)['"]?\)/g)) {
        assert.ok(existsSync(new URL(asset, new URL(path, base))), `${path}: ${asset}`);
      }
    });
  }
  assert.match(read('styles/shared.css'), /width: var\(--enroll-container-width, 100%\)/);
  assert.match(read('styles/shared.css'), /left: var\(--enroll-container-left, 0px\)/);
  assert.match(read('components/LayoutComponents.jsx'), /new ResizeObserver\(syncBounds\)/);
});

test('待提交报名可从列表调用后端删除并同步移除前端记录', () => {
  const page = read('pages/PortalPages.jsx');
  const service = read('services/application.service.js');
  assert.match(page, /application\.status === '待提交'/);
  assert.match(page, /enrollmentService\.deleteApplication\(application\.id\)/);
  assert.match(page, /setSource\(\(items\) => items\.filter\(\(item\) => item\.id !== application\.id\)\)/);
  assert.match(page, /event\.stopPropagation\(\)/);
  assert.match(service, /api\.delete\(`\/enrollment\/applications\/\$\{encodeURIComponent\(applicationId\)\}`\)/);
});
