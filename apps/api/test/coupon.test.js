const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const validation = require('../src/modules/coupon/validations/coupon.validation');

test('消费券输入拒绝非法券码与缺失幂等标识', () => {
  assert.throws(() => validation.verification({ code: '12a45678', storeId: 'store-1' }));
  assert.throws(() => validation.verification({ code: '12345678', storeId: 'store-1' }, true));
  assert.deepEqual(validation.claim({ ticketId: 'dining-30' }), { ticketId: 'dining-30' });
});

test('演示领取、跨门店校验、凭证刷新、幂等核销和过期流程', async () => {
  const directory = path.resolve(__dirname, '../../web/src/modules/coupon/mocks');
  const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const memory = new Map();
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) } });
  const originalNow = Date.now;
  try {
    const fixtures = dataUrl(fs.readFileSync(path.join(directory, 'data.js'), 'utf8'));
    const source = fs.readFileSync(path.join(directory, 'mockApi.js'), 'utf8').replace("'./data'", JSON.stringify(fixtures));
    const { couponMockApiAdapter: adapter } = await import(dataUrl(source));
    const call = async (url, data, params) => (await adapter({ url: `/coupon${url}`, method: data ? 'post' : 'get', data, params })).data;
    const claimed = await call('/wallet', { ticketId: 'dining-30' });
    assert.equal(claimed.code, 0);
    assert.notEqual((await call('/wallet', { ticketId: 'dining-30' })).code, 0);
    assert.match((await call('/wallet', { ticketId: 'appliance-100' })).message, /尚未开始/);
    const id = claimed.data.id;
    const credential = (await call(`/wallet/${id}/credential`, {})).data;
    assert.match(credential.code, /^\d{8}$/);
    assert.match((await call('/verifications/preview', { code: credential.code, storeId: 'store-2' })).message, /不适用/);
    const refreshed = (await call(`/wallet/${id}/credential`, {})).data;
    if (refreshed.code !== credential.code) assert.notEqual((await call('/verifications/preview', { code: credential.code, storeId: 'store-1' })).code, 0);
    const input = { code: refreshed.code, storeId: 'store-1', requestId: 'request-1' };
    assert.equal((await call('/verifications/preview', input)).code, 0);
    assert.equal((await call(`/wallet/${id}`)).data.status, 'available');
    const first = await call('/verifications', input);
    assert.equal(first.code, 0);
    assert.equal((await call('/verifications', input)).data.id, first.data.id);
    assert.notEqual((await call('/verifications', { ...input, requestId: 'request-2' })).code, 0);
    assert.equal((await call(`/wallet/${id}`)).data.status, 'used');
    assert.equal((await call('/verifications', null, { storeId: 'store-1' })).data.filter((entry) => entry.requestId === 'request-1').length, 1);
    const second = (await call('/wallet', { ticketId: 'dining-10' })).data;
    const expiring = (await call(`/wallet/${second.id}/credential`, {})).data;
    Date.now = () => originalNow() + 61000;
    assert.match((await call('/verifications/preview', { code: expiring.code, storeId: 'store-1' })).message, /过期/);
    Date.now = originalNow;
    const pending = await call('/requests', { couponId: second.id, storeId: 'store-1' });
    assert.equal(pending.code, 0);
    assert.equal((await call(`/wallet/${second.id}`)).data.status, 'pending');
    assert.notEqual((await call(`/wallet/${second.id}/credential`, {})).code, 0);
    Date.now = () => originalNow() + 301000;
    assert.equal((await call(`/requests/${pending.data.id}`)).data.status, 'expired');
    assert.equal((await call(`/wallet/${second.id}`)).data.status, 'available');
    Date.now = originalNow;
    const nextPending = await call('/requests', { couponId: second.id, storeId: 'store-1' });
    const confirmed = await call(`/requests/${nextPending.data.id}/confirm`, { requestId: 'pending-confirm-1' });
    assert.equal(confirmed.code, 0);
    assert.equal((await call(`/requests/${nextPending.data.id}/confirm`, { requestId: 'pending-confirm-1' })).data.id, confirmed.data.id);
    assert.equal((await call(`/wallet/${second.id}`)).data.status, 'used');
    const expiringCoupon = (await call('/wallet', { ticketId: 'dining-60' })).data;
    Date.now = () => originalNow() + 8 * 86400000;
    assert.equal((await call(`/wallet/${expiringCoupon.id}`)).data.status, 'expired');
  } finally {
    Date.now = originalNow;
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else delete globalThis.localStorage;
  }
});
