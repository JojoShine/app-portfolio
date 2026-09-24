import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/modules/library/LibraryApp.jsx', import.meta.url), 'utf8');
const profile = readFileSync(new URL('../src/modules/library/pages/ProfilePage.jsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/modules/library/pages/HomePage.jsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/modules/library/components/LibraryLayout.jsx', import.meta.url), 'utf8');
const favorites = readFileSync(new URL('../src/modules/library/pages/FavoritesPage.jsx', import.meta.url), 'utf8');
const history = readFileSync(new URL('../src/modules/library/pages/ReadingHistoryPage.jsx', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../src/modules/library/pages/BorrowingRulesPage.jsx', import.meta.url), 'utf8');
const reading = readFileSync(new URL('../src/modules/library/pages/ReadingPlanPage.jsx', import.meta.url), 'utf8');
const messages = readFileSync(new URL('../src/modules/library/pages/MessagesPage.jsx', import.meta.url), 'utf8');
const myEvents = readFileSync(new URL('../src/modules/library/pages/MyEventsPage.jsx', import.meta.url), 'utf8');
const css = [
  readFileSync(new URL('../src/modules/library/styles/shell.css', import.meta.url), 'utf8'),
  ...['pages/foundation.css', 'pages/personal.css', 'pages/dialogs.css', 'pages/profile.css', 'pages/reading.css', 'pages/messages.css', 'pages/my-events.css', 'pages/personal-header.css']
    .map((file) => readFileSync(new URL(`../src/modules/library/styles/${file}`, import.meta.url), 'utf8')),
].join('\n');

test('我的页面三个功能入口都有独立页面路由', () => {
  assert.match(app, /path="favorites"/);
  assert.match(app, /path="reading-history"/);
  assert.match(app, /path="rules"/);
  assert.match(profile, /navigate\('\/library\/favorites'\)/);
  assert.match(profile, /navigate\('\/library\/reading-history'\)/);
  assert.match(profile, /navigate\('\/library\/rules'\)/);
});

test('我的页面不再展示任何设置入口', () => {
  assert.doesNotMatch(profile, /SetOutline/);
  assert.doesNotMatch(profile, />设置</);
  assert.doesNotMatch(profile, /aria-label="设置"/);
});

test('借阅码入口生成二维码并通过专用弹窗展示', () => {
  assert.match(profile, /import QRCode from 'qrcode'/);
  assert.match(profile, /QRCode\.toDataURL\(`library:reader:\$\{profile\.cardNumber\}`/);
  assert.match(profile, /<LibraryDialog open=\{readerCodeOpen\} variant="reader-code"/);
  assert.match(profile, /onClick=\{\(\) => setReaderCodeOpen\(true\)\}/);
  assert.match(home, /navigate\('\/library\/profile\?readerCode=1'\)/);
  assert.match(css, /\.lib-dialog-reader-code \.lib-dialog-paper::after\s*\{[^}]*library-ink-landscape\.png[^}]*opacity:\s*\.16[^}]*mask-image:/s);
  assert.match(css, /\.lib-dialog-reader-code\s*\{[^}]*overflow-x:\s*hidden/s);
  assert.match(css, /\.lib-dialog-reader-code \.lib-dialog-paper::after\s*\{[^}]*right:\s*0[^}]*left:\s*0/s);
});

test('个人页面复用统一返回按钮', () => {
  assert.match(favorites, /lib-favorites/);
  assert.match(css, /\.lib-page-header > \.lib-back-button svg\s*\{[^}]*width:\s*20px[^}]*height:\s*20px/s);
});

test('收藏与阅读记录的插画不会随页面高度纵向重复', () => {
  assert.match(css, /\.lib-personal-list\s*\{[^}]*library-paper\.png[^}]*background-repeat:\s*repeat/s);
  assert.doesNotMatch(css, /\.lib-personal-list[^}]*book-detail-paper\.png[^}]*repeat-y/s);
  assert.doesNotMatch(css, /\.lib-favorites\s*\{[^}]*background-image/s);
  assert.doesNotMatch(css, /\.lib-history-summary::after/);
  assert.match(css, /\.lib-history-summary\s*\{[^}]*margin:\s*0 -20px[^}]*padding:\s*14px 25px 15px[^}]*background:\s*transparent[^}]*border-bottom:/s);
  assert.doesNotMatch(css, /\.lib-history-summary\s*\{[^}]*border-top:/s);
});

test('办证与借阅规则页头与山水插画沉浸式连续渲染', () => {
  assert.match(css, /\.lib-rules\s*\{[^}]*background-color:\s*#f4f0e8[^}]*library-paper\.png[^}]*background-size:\s*760px auto[^}]*background-repeat:\s*repeat/s);
  assert.doesNotMatch(css, /\.lib-rules::before/);
  assert.doesNotMatch(rules, /lib-rules-intro/);
  assert.doesNotMatch(css, /\.lib-rules \.lib-page-header > button svg/);
});

test('个人中心功能页复用统一水墨插画页头', () => {
  [favorites, history, rules, reading, messages, myEvents].forEach((page) => {
    assert.match(page, /lib-personal-subpage/);
    assert.match(page, /<PersonalPageHeader/);
  });
  assert.match(layout, /function PersonalPageHeader\(\{ title, action \}\)/);
  assert.match(css, /\.lib-personal-page-hero\s*\{[^}]*min-height:\s*calc\(clamp\(150px,\s*38vw,\s*178px\)[^}]*personal-subpage-header\.png/s);
  assert.match(css, /\.lib-personal-page-hero\s*\{[^}]*background-position:\s*center,\s*center bottom[^}]*background-size:\s*100% 100%,\s*cover/s);
  assert.doesNotMatch(reading, /lib-reading-masthead|lib-script-brand/);
  assert.doesNotMatch(css, /\.lib-messages \.lib-message-tabs::after/);
  assert.doesNotMatch(myEvents, /lib-my-events-intro/);
  assert.match(css, /\.lib-page\.lib-messages\s*\{[^}]*background-color:\s*#f4f0e8[^}]*library-paper\.png[^}]*background-size:\s*760px auto[^}]*background-repeat:\s*repeat/s);
  assert.match(messages, /lib-message-footer/);
});
