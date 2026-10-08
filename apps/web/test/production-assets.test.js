import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';

test('生产环境资源遵循应用 API 前缀，不改写外部或已加前缀的图片', async () => {
  const source = await readFile(new URL('../src/app/config/env.js', import.meta.url), 'utf8');
  // Node 没有 Vite 编译期变量；只替换环境输入，执行真实 URL 处理函数。
  const productionEnv = { VITE_API_BASE_URL: '/app-portfolio/api', BASE_URL: '/app-portfolio/', VITE_USE_MOCK_API: 'false' };
  const module = await import('data:text/javascript;base64,' + Buffer.from(source.replaceAll('import.meta.env', JSON.stringify(productionEnv))).toString('base64'));
  assert.equal(module.appConfig.routerBaseName, '/app-portfolio');
  assert.equal(module.appConfig.useMockApi, false);
  assert.equal(typeof module.resolveApiResourceUrl, 'function');
  for (const [input, expected] of [
    ['/api/quiz/assets/city', '/app-portfolio/api/quiz/assets/city'],
    ['/api/green-points/assets/cup', '/app-portfolio/api/green-points/assets/cup'],
    ['/app-portfolio/api/quiz/assets/city', '/app-portfolio/api/quiz/assets/city'],
    ['https://example.com/cup.png', 'https://example.com/cup.png'],
    [undefined, undefined],
  ]) assert.equal(module.resolveApiResourceUrl(input), expected);
});
