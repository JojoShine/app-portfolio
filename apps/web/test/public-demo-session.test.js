import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

test('公共演示并发请求共用一次签发，过期自动续签且不会无限重试', async () => {
  let issued = 0;
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/auth/demo-token') {
      issued++;
      res.end(JSON.stringify({code:0,data:{accessToken:'demo-' + issued}}));
    } else if (req.url === '/denied' || req.headers.authorization !== 'Bearer demo-' + issued) {
      res.statusCode = 401;
      res.end(JSON.stringify({code:1003,message:'expired'}));
    } else res.end(JSON.stringify({code:0,data:{ok:true}}));
  });
  server.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const config = {apiBaseUrl:`http://127.0.0.1:${server.address().port}`,requestTimeoutMs:3000,publicDemo:true};
    const source = (await readFile(new URL('../src/shared/api/api.js', import.meta.url), 'utf8'))
      .replace("from 'axios'", `from '${import.meta.resolve('axios')}'`)
      .replace("import { appConfig } from '../../app/config/env';", `const appConfig = ${JSON.stringify(config)};`)
      .replace("import useSessionStore from '../auth/sessionStore';", 'const state={accessToken:null,setAccessToken(token){this.accessToken=token},clearSession(){this.accessToken=null}}; const useSessionStore={getState:()=>state};');
    const module = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    assert.equal(typeof module.ensurePublicDemoSession, 'function');
    await Promise.all([module.ensurePublicDemoSession(), module.ensurePublicDemoSession()]);
    assert.equal(issued, 1);
    issued = 2; // 模拟已有 Token 过期。
    assert.deepEqual(await module.default.get('/protected'), {ok:true});
    assert.equal(issued, 3);
    await assert.rejects(module.default.get('/denied'), error => error.status === 401);
    assert.equal(issued, 4);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
