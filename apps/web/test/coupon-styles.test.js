import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const base = new URL('../src/modules/coupon/', import.meta.url);
const read = (path) => readFileSync(new URL(path, base), 'utf8');
const pages = ['home', 'activity', 'wallet', 'coupon-detail', 'merchants', 'merchant', 'rules', 'manual-code', 'verification-confirm', 'verification-result', 'select-coupon', 'pending', 'pending-list', 'records', 'scan'];

test('消费券使用模块级设计令牌并按业务页面拆分样式', () => {
  assert.match(read('CouponApp.jsx'), /import '\.\/styles\/index\.css'/);
  const entry = read('styles/index.css');
  assert.match(entry, /tokens\.css/);
  assert.match(entry, /shell\.css/);
  assert.match(entry, /components\.css/);
  assert.match(entry, /pages\.css/);
  assert.match(entry, /responsive\.css/);
  assert.match(read('styles/tokens.css'), /\.coupon-app\s*\{/);
  assert.doesNotMatch(read('styles/tokens.css'), /:root/);
  for (const page of pages) {
    assert.match(read('styles/pages.css'), new RegExp(`@import './pages/${page}\\.css';`));
    assert.ok(postcss.parse(read(`styles/pages/${page}.css`)).nodes.length > 0);
  }
});

test('消费券页面跟随外层可用宽度且不保留手机固定宽度上限', () => {
  const paths = ['styles/tokens.css', 'styles/shell.css', 'styles/components.css', 'styles/responsive.css', ...pages.map((page) => `styles/pages/${page}.css`)];
  for (const path of paths) {
    const css = postcss.parse(read(path));
    css.walkDecls((decl) => {
      if (['width', 'max-width', 'min-width'].includes(decl.prop)) assert.doesNotMatch(decl.value, /(?:430|760)px/, `${path} 仍包含固定宽度 ${decl.value}`);
    });
  }
  assert.match(read('styles/shell.css'), /\.app-shell__content:has\(\.coupon-app\)[^{]*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s);
  assert.match(read('styles/shell.css'), /\.coupon-app[^{]*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s);
});
