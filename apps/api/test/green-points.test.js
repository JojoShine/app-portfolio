const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/database');
const { issueAccessToken } = require('../src/system/auth').service;

test('积分商城目录与用户交互均通过数据库接口持久化', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const userId = `green-points-test-${randomUUID()}`;
  const token = issueAccessToken({ userId, roles: ['citizen'] });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const base = `${origin}/api/green-points`;
  const request = async (path, options = {}) => {
    const response = await fetch(`${base}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
    return { status: response.status, ...(await response.json()) };
  };
  try {
    assert.equal((await request('/read', { headers: { Authorization: '' } })).status, 401);
    const initial = await request('/read');
    assert.equal(initial.status, 200);
    assert.ok(initial.data.products.length >= 16);
    assert.match(initial.data.products[0].imageUrl, /^\/api\/green-points\/assets\//);
    const image = await fetch(`${origin}${initial.data.products[0].imageUrl}`);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /^image\//);
    const productId = initial.data.products[0].id;
    assert.equal((await request('/favorite', { method: 'POST', body: JSON.stringify({ id: productId }) })).status, 200);
    assert.ok((await request('/read')).data.favorites.includes(productId));
    assert.equal((await request('/claim-coupon', { method: 'POST', body: JSON.stringify({ id: 'welcome' }) })).status, 200);
    assert.ok((await request('/read')).data.wallet.some((coupon) => coupon.id === 'welcome'));
    const address = await request('/save-address', { method: 'POST', body: JSON.stringify({ name: '测试用户', phone: '13800138000', detail: '江苏省南通市海安市测试路 1 号', isDefault: true }) });
    const beforeRedeem = await request('/read');
    const redeemed = await request('/redeem', { method: 'POST', body: JSON.stringify({ requestId: randomUUID(), productId: 'cup', quantity: 1, delivery: 'shipping', addressId: address.data.id }) });
    assert.equal(redeemed.status, 200);
    assert.equal((await request('/read')).data.balance, beforeRedeem.data.balance - redeemed.data.total);
    assert.equal((await request('/cancel', { method: 'POST', body: JSON.stringify({ id: redeemed.data.id }) })).status, 200);
    assert.equal((await request('/read')).data.balance, beforeRedeem.data.balance);
  } finally {
    await db.greenPointsAccount.deleteMany({ where: { userId } });
    await new Promise((resolve) => server.close(resolve));
  }
});
