import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mockApiAdapter as enrollmentMockApiAdapter } from '../src/modules/enrollment/mocks/mockApi.js';

const css = readFileSync(new URL('../src/modules/library/library.css', import.meta.url), 'utf8');
const services = readFileSync(new URL('../src/modules/library/pages/ServicesPage.jsx', import.meta.url), 'utf8');
const login = readFileSync(new URL('../src/modules/library/pages/LoginPage.jsx', import.meta.url), 'utf8');

test('服务页顶部使用独立建筑线稿并保留可编辑标题层', () => {
  assert.match(services, /service-library-sketch\.png/);
  assert.match(services, /className="lib-service-sketch"/);
  assert.match(services, /className="lib-service-brand-mark"/);
  assert.match(css, /\.lib-service-sketch\s*\{[^}]*object-fit:\s*contain[^}]*opacity:/s);
  assert.match(css, /\.lib-services > \.lib-service-head\s*\{[^}]*max-width:\s*none[^}]*background-image:\s*none/s);
  assert.match(css, /\.lib-service-brand-mark::after\s*\{[^}]*bottom:\s*5px[^}]*left:\s*10px[^}]*width:\s*7px/s);
  assert.match(css, /\.lib-service-head h1\s*\{[^}]*margin:\s*14px 0 2px -32px[^}]*font-size:\s*42px/s);
});

test('服务页借阅与预约区域按设计稿形成连续分隔式页面', () => {
  assert.match(services, /className="lib-reader-signature"/);
  assert.match(services, /className="lib-loan-excerpt"/);
  assert.match(services, /service-seat-icon\.png/);
  assert.match(css, /\.lib-reader-strip\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.lib-loan\s*\{[^}]*height:\s*190px[^}]*grid-template-columns:\s*108px minmax\(0,1fr\) 92px[^}]*grid-template-rows:\s*150px 20px/s);
  assert.match(css, /\.lib-loan > img\s*\{[^}]*height:\s*150px[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.lib-service-links\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\) 88px/s);
  assert.match(css, /\.lib-reader-signature\s*\{[^}]*min-width:\s*0[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.lib-reader-signature small\s*\{[^}]*font-size:\s*7px[^}]*letter-spacing:\s*\.04em[^}]*white-space:\s*nowrap/s);
});

test('服务页未登录时进入登录流程并在登录后返回', () => {
  assert.match(services, /Navigate to="\/library\/login" replace state=\{\{ from: '\/library\/services' \}\}/);
  assert.match(login, /location\.state\?\.from \|\| '\/library\/profile'/);
});

test('招生 mock 不拦截图书馆真实后端请求', async () => {
  const response = await enrollmentMockApiAdapter({ method: 'get', url: '/library/loans' });
  assert.equal(response, null);
});
