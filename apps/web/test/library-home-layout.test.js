import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/modules/library/library.css', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/modules/library/pages/HomePage.jsx', import.meta.url), 'utf8');
const assets = readFileSync(new URL('../src/modules/library/components/AssetImage.jsx', import.meta.url), 'utf8');

test('首页借阅码使用深墨色并与其余朱砂图标区分', () => {
  assert.match(css, /\.lib-quick button:first-child svg\s*\{[^}]*color:\s*var\(--lib-ink\)/s);
});

test('首页提醒条与快捷区留出纸面间距并保持票据比例', () => {
  assert.match(css, /\.lib-home \.lib-reminder\s*\{[^}]*margin-top:\s*8px/s);
  assert.match(css, /\.lib-home \.lib-reminder\s*\{[^}]*width:\s*calc\(100% \+ 16px\)/s);
  assert.match(css, /\.lib-home \.lib-reminder\s*\{[^}]*padding:\s*9px 0/s);
  assert.match(css, /\.lib-home \.lib-reminder\s*\{[^}]*grid-template-columns:\s*34px 58px minmax\(0,1fr\) 18px 78px/s);
  assert.match(css, /\.lib-reminder-callno\s*\{[^}]*border-right:\s*1px solid/s);
  assert.match(css, /\.lib-home \.lib-reminder img\s*\{[^}]*width:\s*50px/s);
  assert.match(css, /\.lib-home \.lib-reminder\s*\{[^}]*background-color:\s*rgba\(255,253,248,\.46\)/s);
});

test('今日一书和右侧组合区等高且活动区包含查看全部入口', () => {
  assert.match(css, /\.lib-home-grid\s*\{[^}]*height:\s*246px[^}]*min-height:\s*246px/s);
  assert.match(css, /\.lib-event-peek > button\s*\{[^}]*min-height:\s*72px/s);
  assert.match(css, /\.lib-event-peek > button img\s*\{[^}]*height:\s*66px/s);
  assert.match(css, /\.lib-event-heading h3\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(home, /className="lib-event-heading"/);
  assert.match(home, /navigate\('\/library\/events'\)/);
});

test('海安共读以单张插画承载标题和叠加文案', () => {
  assert.match(assets, /home-community-v2\.png/);
  assert.match(home, /className="lib-community-visual"[^>]*>[\s\S]*fallback="homeCommunity"[\s\S]*海安共读[\s\S]*以阅读，[\s\S]*共建更温暖的海安/);
  assert.match(css, /\.lib-community-visual\s*\{[^}]*height:\s*121px[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(css, /\.lib-community > \.lib-community-visual\s*\{[^}]*box-shadow:/s);
  assert.match(css, /\.lib-community-visual > img\s*\{[^}]*position:\s*absolute[^}]*width:\s*100%[^}]*height:\s*100%/s);
});

test('今日一书封面使用书脊阴影呈现实体书厚度', () => {
  assert.match(css, /\.lib-book-editorial > img\s*\{[^}]*box-shadow:\s*-3px 1px 0 rgba\(111,99,83,\.28\),\s*6px 9px 14px rgba\(62,48,34,\.24\)/s);
  assert.match(css, /\.lib-book-editorial > img\s*\{[^}]*transform:\s*perspective\(400px\) rotateY\(1deg\)/s);
});

test('首页箭头按用途区分且通知铃铛按设计稿收窄', () => {
  assert.match(home, /RightOutline/);
  assert.match(home, /className="lib-long-arrow"/);
  assert.match(css, /\.lib-long-arrow\s*\{[^}]*display:\s*grid[^}]*place-items:\s*center/s);
  assert.match(css, /\.lib-long-arrow\s*\{[^}]*line-height:\s*1/s);
  assert.match(css, /\.lib-brand-row button svg\s*\{[^}]*width:\s*28px[^}]*height:\s*28px[^}]*transform:\s*scaleX\(\.82\)[^}]*vertical-align:\s*0/s);
  assert.match(css, /\.lib-page \.lib-chevron\s*\{[^}]*width:\s*12px[^}]*height:\s*12px[^}]*flex:\s*0 0 12px/s);
  assert.doesNotMatch(home, /lib-community-arrow/);
  assert.doesNotMatch(css, /\.lib-page \.lib-community-arrow/);
});

test('所有主页面使用同一固定高度的底部导航', () => {
  assert.match(css, /\.lib-tabbar\s*\{[^}]*height:\s*calc\(72px \+ env\(safe-area-inset-bottom\)\)/s);
  assert.doesNotMatch(css, /\.lib-home \.lib-tabbar/);
});
