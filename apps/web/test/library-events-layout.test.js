import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = ['pages/foundation.css', 'pages/events.css', 'responsive.css']
  .map((file) => readFileSync(new URL(`../src/modules/library/styles/${file}`, import.meta.url), 'utf8')).join('\n');
const page = readFileSync(new URL('../src/modules/library/pages/EventsPage.jsx', import.meta.url), 'utf8');
const assetImage = readFileSync(new URL('../src/modules/library/components/AssetImage.jsx', import.meta.url), 'utf8');

test('活动页使用独立的四人共读主视觉素材', () => {
  assert.match(assetImage, /readingEventsHero/);
  assert.match(page, /fallback="readingEventsHero"/);
});

test('活动页主视觉从顶部和左侧渐隐融入纸张背景', () => {
  assert.match(css, /\.lib-events-head::before\s*\{[^}]*background:[^}]*linear-gradient\(to bottom/s);
  assert.match(css, /\.lib-events-head > \.lib-events-hero-image\s*\{[^}]*mask-image:[^}]*transparent 0/s);
});

test('活动分类标签不被全局按钮高度撑大', () => {
  assert.match(css, /\.lib-event-tabs button\s*\{[^}]*min-height:\s*0[^}]*height:\s*30px/s);
  assert.match(css, /\.lib-event-tabs button\.is-active\s*\{[^}]*min-height:\s*32px[^}]*height:\s*32px/s);
  assert.match(css, /\.lib-event-tabs button\.is-active\s*\{[^}]*padding:\s*0 11px[^}]*font-size:\s*14px/s);
  assert.match(css, /\.lib-event-tabs button\s*\{[^}]*font-family:\s*"Songti SC"[^}]*font-weight:\s*500/s);
});

test('活动日期使用月份左上日期右下的错位布局', () => {
  assert.match(css, /\.lib-event-list time b\s*\{[^}]*position:\s*relative[^}]*display:\s*block/s);
  assert.match(css, /\.lib-event-list time b span:first-child\s*\{[^}]*top:\s*0[^}]*left:\s*0/s);
  assert.match(css, /\.lib-event-list time b span:last-child\s*\{[^}]*right:\s*0[^}]*bottom:\s*0/s);
  assert.match(page, /<i aria-hidden="true">\/<\/i>/);
  assert.match(page, /className=\{!isFeatured \? 'is-date-mark' : ''\}/);
  assert.match(css, /\.lib-event-list time > small\.is-date-mark::before\s*\{[^}]*width:\s*10px[^}]*background:\s*var\(--lib-red\)/s);
});

test('重点活动图片来自业务记录，保留原有图片容器布局', () => {
  assert.match(page, /className="lib-event-book"/);
  assert.match(page, /className="lib-event-book-photo" remote=\{event.coverUrl\}/);
  assert.doesNotMatch(page, /className="lib-event-book-cover"/);
});

test('重点活动右侧插画随卡片高度铺满且宽度响应屏幕', () => {
  assert.match(css, /\.lib-event-list \.lib-event-book\s*\{[^}]*bottom:\s*0[^}]*width:\s*clamp\(150px,\s*42vw,\s*190px\)[^}]*height:\s*auto/s);
  assert.match(css, /\.lib-event-book-photo\s*\{[^}]*height:\s*100%[^}]*object-fit:\s*cover/s);
});

test('重点活动的日期与席位信息按设计稿分层展示', () => {
  assert.match(page, /isFeatured && <TeamOutline \/>/);
  assert.match(css, /\.lib-event-list \.is-featured time\s*\{[^}]*height:\s*126px[^}]*justify-content:\s*flex-start/s);
  assert.match(css, /\.lib-event-list \.is-featured time::before\s*\{[^}]*background:\s*var\(--lib-red\)/s);
  assert.match(css, /\.lib-event-list \.is-featured \.lib-event-copy strong\s*\{[^}]*position:\s*static[^}]*margin-top:\s*3px/s);
  assert.match(css, /\.lib-event-list \.is-featured \.lib-event-copy strong\s*\{[^}]*justify-content:\s*flex-start[^}]*text-align:\s*left/s);
});

test('重点活动报名标识贴近卡片下边界', () => {
  assert.match(css, /\.lib-event-list > button\.is-featured\s*\{[^}]*padding:\s*8px 0 5px/s);
  assert.match(css, /\.lib-event-list \.is-featured \.lib-event-copy\s*\{[^}]*padding-bottom:\s*0/s);
  assert.match(css, /\.lib-event-list \.is-featured \.lib-event-copy p\s*\{[^}]*margin-bottom:\s*7px/s);
  assert.match(css, /\.lib-event-list \.is-featured \.lib-event-copy strong\s*\{[^}]*margin-top:\s*3px/s);
});

test('活动列表的图片日期和正文列宽严格对齐设计稿', () => {
  assert.match(css, /\.lib-event-list\s*\{[^}]*padding:\s*0 18px/s);
  assert.match(css, /\.lib-event-list > button\s*\{[^}]*min-height:\s*104px[^}]*grid-template-columns:\s*124px 59px minmax\(0,1fr\)[^}]*gap:\s*12px/s);
  assert.match(css, /\.lib-event-list > button\.is-featured\s*\{[^}]*min-height:\s*126px[^}]*padding:\s*0[^}]*grid-template-columns:\s*76px minmax\(0,1fr\);/s);
});
