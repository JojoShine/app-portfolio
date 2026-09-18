import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/modules/library/library.css', import.meta.url), 'utf8');
const catalog = readFileSync(new URL('../src/modules/library/pages/CatalogPage.jsx', import.meta.url), 'utf8');

test('馆藏头图突破内容宽度并完整铺满页面', () => {
  assert.match(css, /\.lib-catalog > \.lib-catalog-head\s*\{[^}]*max-width:\s*none/s);
});

test('馆藏筛选按钮不被全局按钮高度撑大', () => {
  assert.match(css, /\.lib-page \.lib-filter-button\s*\{[^}]*min-height:\s*36px/s);
});

test('馆藏筛选按钮使用轻量纸面样式并反馈展开状态', () => {
  assert.match(css, /\.lib-page \.lib-filter-button\s*\{[^}]*background:\s*rgba\(255,253,248,\.72\)[^}]*border-radius:\s*10px[^}]*box-shadow:/s);
  assert.match(css, /\.lib-filter-button\[aria-expanded="true"\] svg\s*\{[^}]*rotate\(180deg\)/s);
});

test('馆藏封面以书脊和页边阴影呈现实实体积', () => {
  assert.match(catalog, /className="lib-book-cover"/);
  assert.match(css, /\.lib-book-cover::before\s*\{[^}]*linear-gradient/s);
  assert.match(css, /\.lib-book-cover::after\s*\{[^}]*box-shadow:/s);
});
