import { activities, merchants, createDemoState, nextBatchAt } from './data';
const key = 'coupon-demo-v2';
let state;
try { state = JSON.parse(localStorage.getItem(key)); } catch { state = null; }
if (!state || !Array.isArray(state.requests)) state = createDemoState();
const save = () => localStorage.setItem(key, JSON.stringify(state));
const fail = (message) => { throw new Error(message); };
const coupon = (id) => [...state.wallet, ...(state.otherCoupons || [])].find((item) => item.id === id) || fail('消费券不存在');
const store = (id) => merchants.find((item) => item.id === id) || fail('门店不存在');
const applicable = (item, merchant) => merchant.category === item.category && (item.region !== '建湖县' || merchant.region === item.region);
const request = (id) => state.requests.find((item) => item.id === id) || fail('核销申请不存在');
const check = (code, storeId) => {
  if (!/^\d{8}$/.test(code || '')) fail('请输入8位数字券码');
  const credential = state.credentials.find((item) => item.code === code);
  if (!credential || credential.expiresAt <= Date.now()) fail('券码已过期，请用户重新出示');
  const item = coupon(credential.couponId);
  if (item.status !== 'available') fail('该券已使用、已锁定或已过期，不能重复核销');
  const merchant = store(storeId);
  if (!applicable(item, merchant)) fail('当前门店不适用该消费券');
  return { coupon: item, store: merchant, user: '李**', code };
};
const syncStatus = () => {
  state.requests.forEach((entry) => {
    if (entry.status === 'pending' && entry.expiresAt <= Date.now()) {
      entry.status = 'expired';
      const item = coupon(entry.coupon.id);
      if (item.status === 'pending') { item.status = 'available'; delete item.requestId; }
    }
  });
  state.wallet.forEach((item) => { if (item.status === 'available' && Date.parse(item.expiresAt) <= Date.now()) item.status = 'expired'; });
};
const record = (preview, requestId, method) => {
  preview.coupon.status = 'used';
  const item = { ...preview, id: `HX${Date.now()}${crypto.randomUUID().slice(0, 4)}`, requestId, createdAt: new Date().toISOString(), method };
  state.records.unshift(item);
  return item;
};
export const couponMockApiAdapter = (config) => {
  const path = new URL(config.url, 'http://mock.local').pathname.replace(/^\/api/, '');
  if (!path.startsWith('/coupon/')) return null;
  const method = (config.method || 'get').toLowerCase();
  let data;
  let payload;
  try {
    const persisted = localStorage.getItem(key);
    if (persisted) state = JSON.parse(persisted);
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
    if (!state.historyVersion) {
      const seed = createDemoState();
      state.records.push(...seed.records.filter((item) => !state.records.some((entry) => entry.requestId === item.requestId)));
      state.requests.push(...seed.requests);
      state.otherCoupons = seed.otherCoupons;
      state.historyVersion = 2;
    }
    syncStatus();
    if (path === '/coupon/activities' && method === 'get') data = activities.map((item) => ({ ...item, nextBatchAt }));
    else if (path.startsWith('/coupon/activities/') && method === 'get') data = activities.find((item) => item.id === path.split('/').pop()) || fail('活动不存在');
    else if (path === '/coupon/merchants' && method === 'get') data = merchants;
    else if (path === '/coupon/wallet' && method === 'get') data = state.wallet;
    else if (path === '/coupon/wallet' && method === 'post') {
      const activity = activities.find((item) => item.tickets.some((ticket) => ticket.id === body.ticketId));
      if (!activity) fail('券种不存在');
      if (activity.status !== 'active') fail(activity.status === 'upcoming' ? '活动尚未开始' : '活动已结束');
      const ticket = activity.tickets.find((item) => item.id === body.ticketId);
      if (state.wallet.some((item) => item.ticketId === ticket.id)) fail('每种券限领一张，您已领取');
      if (ticket.stock === '已抢光') fail('本批次已抢光');
      data = { ...ticket, id: crypto.randomUUID(), ticketId: ticket.id, activityName: activity.name, category: activity.category, region: activity.region, status: 'available', expiresAt: new Date(Date.now() + ticket.days * 86400000).toISOString() };
      state.wallet.unshift(data);
    } else if (/^\/coupon\/wallet\/[^/]+$/.test(path) && method === 'get') data = coupon(path.split('/').pop());
    else if (path.endsWith('/credential') && method === 'post') {
      const item = coupon(path.split('/')[3]);
      if (item.status !== 'available') fail('当前消费券不可使用');
      state.credentials = state.credentials.filter((entry) => entry.couponId !== item.id && entry.expiresAt > Date.now());
      let code;
      do { code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 100000000).padStart(8, '0'); } while (state.credentials.some((entry) => entry.code === code));
      data = { code, expiresAt: Date.now() + 60000 };
      state.credentials.push({ ...data, couponId: item.id });
    } else if (path === '/coupon/verifications/preview' && method === 'post') data = check(body.code, body.storeId);
    else if (path === '/coupon/verifications' && method === 'post') {
      if (!body.requestId) fail('缺少核销请求标识');
      data = state.records.find((item) => item.requestId === body.requestId);
      if (data && (data.code !== body.code || data.store.id !== body.storeId)) fail('重复请求参数不一致');
      if (!data) data = record(check(body.code, body.storeId), body.requestId, '动态核销码');
    } else if (path === '/coupon/verifications' && method === 'get') data = state.records.filter((item) => item.store.id === config.params?.storeId);
    else if (/^\/coupon\/verifications\/[^/]+$/.test(path) && method === 'get') data = state.records.find((item) => item.id === path.split('/').pop()) || fail('核销记录不存在');
    else if (path === '/coupon/requests' && method === 'post') {
      const item = coupon(body.couponId);
      const merchant = store(body.storeId);
      if (item.status !== 'available') fail('该券已锁定或不可使用');
      if (!applicable(item, merchant)) fail('当前门店不适用该消费券');
      data = { id: `SQ${Date.now()}${crypto.randomUUID().slice(0, 4)}`, coupon: item, store: merchant, user: '李**', createdAt: new Date().toISOString(), expiresAt: Date.now() + 300000, status: 'pending' };
      item.status = 'pending'; item.requestId = data.id;
      state.requests.unshift(data);
    } else if (path === '/coupon/requests' && method === 'get') data = state.requests.filter((item) => item.store.id === config.params?.storeId && item.status === 'pending');
    else if (/^\/coupon\/requests\/[^/]+$/.test(path) && method === 'get') data = request(path.split('/').pop());
    else if (/^\/coupon\/requests\/[^/]+\/confirm$/.test(path) && method === 'post') {
      const entry = request(path.split('/')[3]);
      if (!body.requestId) fail('缺少核销请求标识');
      if (entry.status === 'confirmed') data = state.records.find((item) => item.id === entry.recordId);
      else {
        if (entry.status !== 'pending' || entry.expiresAt <= Date.now()) fail('申请已超时，消费券已解锁');
        const item = coupon(entry.coupon.id);
        if (item.status !== 'pending' || !applicable(item, entry.store)) fail('消费券状态或适用门店已变化');
        data = record({ coupon: item, store: entry.store, user: entry.user }, body.requestId, '商家确认核销');
        entry.status = 'confirmed'; entry.recordId = data.id;
      }
    } else fail('该消费券接口尚未开放');
    save();
    payload = { code: 0, message: '操作成功', data: structuredClone(data) };
  } catch (error) { payload = { code: 1001, message: error.message, data: null }; }
  return Promise.resolve({ data: payload, status: 200, statusText: 'OK', headers: {}, config });
};
