import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/modules/library/pages/BranchDetailPage.jsx', import.meta.url), 'utf8');
const css = ['pages/foundation.css', 'pages/branch.css']
  .map((file) => readFileSync(new URL(`../src/modules/library/styles/${file}`, import.meta.url), 'utf8')).join('\n');

test('分馆详情使用沉浸式顶部与结构化馆舍信息', () => {
  assert.match(page, /className="lib-branch-hero"/);
  assert.match(page, /className="lib-branch-meta"/);
  assert.match(page, /className="lib-branch-demo"/);
  assert.match(css, /\.lib-branch-hero::after\s*\{[^}]*linear-gradient/s);
  assert.match(css, /\.lib-branch-card\s*\{[^}]*box-shadow:/s);
});

test('楼层与设施服务使用设计稿的标题和内容层级', () => {
  assert.match(page, /className="lib-branch-section-head"/);
  assert.match(css, /\.lib-floor-services button\s*\{[^}]*grid-template-columns:\s*58px minmax\(0,1fr\) 28px/s);
  assert.match(css, /\.lib-facilities > div\s*\{[^}]*border-top:/s);
  assert.match(page, /facilityDescriptions/);
});

test('开放时间和设施服务使用语义化图标', () => {
  assert.match(page, /ClockCircleOutline/);
  assert.match(page, /ScanCodeOutline/);
  assert.match(page, /UserCircleOutline/);
  assert.match(page, /GlobalOutline/);
  assert.match(page, /TeamOutline/);
  assert.match(page, /className="lib-facility-icon"/);
});

test('分馆详情底部按设计稿展示真实近期活动', () => {
  assert.match(page, /useLibraryEvents/);
  assert.match(page, /className="lib-branch-recent"/);
  assert.match(page, /navigate\(`\/library\/events\/\$\{recentEvent\.id\}`\)/);
  assert.doesNotMatch(page, /className="lib-branch-footer"/);
  assert.match(css, /\.lib-branch-recent-card\s*\{[^}]*grid-template-columns:/s);
  assert.match(css, /\.lib-branch-recent-card strong\s*\{[^}]*font-size:\s*16px[^}]*font-weight:\s*600/s);
});

test('白色信息区使用低对比纸张纹理', () => {
  assert.match(css, /\.lib-branch-card\s*\{[^}]*rgba\(255,253,248,\.64\)[^}]*url\('\.\.\/\.\.\/assets\/library-paper\.png'\)[^}]*\/ 360px auto/s);
  assert.match(css, /\.lib-floor-services button\s*\{[^}]*rgba\(255,253,248,\.68\)[^}]*url\('\.\.\/\.\.\/assets\/library-paper\.png'\)[^}]*\/ 340px auto/s);
  assert.match(css, /\.lib-branch-recent-card\s*\{[^}]*rgba\(255,253,248,\.68\)[^}]*url\('\.\.\/\.\.\/assets\/library-paper\.png'\)[^}]*\/ 340px auto/s);
});
