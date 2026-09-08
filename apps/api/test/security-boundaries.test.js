const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';

const app = require('../src/app');

const withServer = async (callback) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('user management rejects anonymous requests', async () => {
  await withServer(async (baseUrl) => {
    const result = await fetch(`${baseUrl}/api/users`);
    assert.equal(result.status, 401);
  });
});

test('catalog writes reject anonymous requests', async () => {
  await withServer(async (baseUrl) => {
    const result = await fetch(`${baseUrl}/api/app/apps`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(result.status, 401);
  });
});
