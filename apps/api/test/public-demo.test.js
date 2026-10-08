const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const env = require('../src/config/env');
const auth = require('../src/system/auth').service;

test('公共演示必须显式开启，只签发固定普通身份，关闭后已发令牌失效', async () => {
  const previous = env.ENABLE_PUBLIC_DEMO;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const create = () => fetch(base + '/auth/demo-token', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({userId:'admin',roles:['admin'],schoolIds:['all']}),
  });
  try {
    env.ENABLE_PUBLIC_DEMO = false;
    assert.equal((await create()).status, 404);
    env.ENABLE_PUBLIC_DEMO = true;
    const response = await create();
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    const {data} = await response.json();
    const user = auth.verifyAccessToken(data.accessToken);
    assert.equal(user.id, 'test-parent-001');
    assert.deepEqual(user.roles, ['reader','parent','citizen']);
    assert.deepEqual(user.schoolIds, []);
    const headers = {Authorization:'Bearer ' + data.accessToken};
    assert.equal((await fetch(base + '/users', {headers})).status, 403);
    assert.equal((await fetch(base + '/auth/me', {headers})).status, 200);
    env.ENABLE_PUBLIC_DEMO = false;
    assert.equal((await fetch(base + '/auth/me', {headers})).status, 401);
  } finally {
    env.ENABLE_PUBLIC_DEMO = previous;
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
