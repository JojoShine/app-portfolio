const crypto = require('crypto');
const db = require('../../../config/database');
const storage = require('../../../config/minio');
const { ValidationError, NotFoundError, ConflictError } = require('../../../common/utils/error');

const DAY = 86400000;
const dayKey = (time) => new Date(time + 8 * 3600000).toISOString().slice(0, 10);
const assetUrl = (id) => `/api/green-points/assets/${encodeURIComponent(id)}`;
const fail = (message) => { throw new ValidationError(message); };

const initialState = (now, settings) => ({
  favorites: [], history: [], addresses: [], wallet: [], support: [], orders: [],
  checkIns: [3, 2, 1].map((days) => dayKey(now - days * DAY)),
  ledger: [
    { id: 'opening', title: '绿色积分账户结余', amount: settings.openingBalance, time: now - 10 * DAY },
    ...['低碳出行奖励', '社区回收奖励', '环保志愿活动'].map((title, index) => ({ id: `seed-${index}`, title, amount: 90, time: now - (6 - index) * DAY })),
    ...[3, 2, 1].map((days) => ({ id: `check-${days}`, title: '每日签到', amount: settings.checkInPoints, time: now - days * DAY })),
  ].sort((left, right) => right.time - left.time),
});

const catalog = async (client = db) => {
  const [products, coupons, activities, config] = await Promise.all([
    client.greenPointsProduct.findMany({ where: { active: true }, orderBy: { sort: 'asc' } }),
    client.greenPointsCoupon.findMany({ where: { active: true }, orderBy: { sort: 'asc' } }),
    client.greenPointsActivity.findMany({ where: { active: true }, orderBy: { sort: 'asc' } }),
    client.greenPointsConfig.findUnique({ where: { id: 'default' } }),
  ]);
  if (!config) throw new ConflictError('积分商城尚未初始化');
  return {
    settings: config.settings,
    products: products.map(({ createdAt, updatedAt, ...product }) => ({ ...product, image: product.imageAssetId, imageUrl: assetUrl(product.imageAssetId) })),
    coupons: coupons.map(({ createdAt, updatedAt, ...coupon }) => coupon),
    activities: activities.map(({ startsAt, endsAt, createdAt, updatedAt, ...activity }) => ({
      ...activity, start: startsAt.getTime(), end: endsAt.getTime(),
      image: activity.imageAssetId, imageUrl: assetUrl(activity.imageAssetId),
    })),
  };
};

const getAccount = async (client, userId, settings, now) => {
  const existing = await client.greenPointsAccount.findUnique({ where: { userId } });
  if (existing) return existing;
  return client.greenPointsAccount.create({ data: { userId, balance: settings.initialBalance, state: initialState(now, settings) } });
};

const present = (account, state, data) => ({
  ...state,
  balance: account.balance,
  products: data.products,
  coupons: data.coupons,
  activities: data.activities,
  categories: data.settings.categories,
});

exports.read = async (userId) => {
  const data = await catalog();
  const account = await getAccount(db, userId, data.settings, Date.now());
  return present(account, account.state, data);
};

const transact = (userId, work) => db.$transaction(async (tx) => {
  const data = await catalog(tx);
  const account = await getAccount(tx, userId, data.settings, Date.now());
  const state = structuredClone(account.state);
  const result = await work({ tx, data, account, state, now: Date.now() });
  await tx.greenPointsAccount.update({ where: { userId }, data: { balance: account.balance, state } });
  return result;
}, { isolationLevel: 'Serializable' });

const addLedger = (account, state, title, amount, now, orderId) => {
  account.balance += amount;
  state.ledger.unshift({ id: crypto.randomUUID(), title, amount, time: now, ...(orderId ? { orderId } : {}) });
};

exports.favorite = (userId, id) => transact(userId, ({ data, state }) => {
  if (!data.products.some((product) => product.id === id)) throw new NotFoundError('商品不存在');
  state.favorites = state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
  return null;
});
exports.view = (userId, id) => transact(userId, ({ data, state }) => {
  if (!data.products.some((product) => product.id === id)) throw new NotFoundError('商品不存在');
  state.history = [id, ...state.history.filter((item) => item !== id)].slice(0, 30);
  return null;
});
exports.claimCoupon = (userId, id) => transact(userId, ({ data, state, now }) => {
  const coupon = data.coupons.find((item) => item.id === id);
  if (!coupon) throw new NotFoundError('抵扣券不存在');
  if (state.wallet.some((item) => item.id === id)) fail('已经领取过这张抵扣券');
  state.wallet.push({ ...coupon, expiresAt: now + coupon.days * DAY, usedBy: null });
  return null;
});
exports.saveAddress = (userId, body) => transact(userId, ({ state }) => {
  if (!body.name?.trim()) fail('请填写收货人');
  if (!/^1[3-9]\d{9}$/.test(body.phone || '')) fail('请填写正确的手机号');
  if (!body.detail?.trim() || body.detail.trim().length < 8) fail('请填写完整的省市区及详细地址');
  if (body.id && !state.addresses.some((item) => item.id === body.id)) throw new NotFoundError('地址不存在');
  const address = { id: body.id || crypto.randomUUID(), name: body.name.trim(), phone: body.phone, detail: body.detail.trim(), isDefault: Boolean(body.isDefault) || !state.addresses.length };
  if (address.isDefault) state.addresses.forEach((item) => { item.isDefault = false; });
  state.addresses = [...state.addresses.filter((item) => item.id !== address.id), address];
  return address;
});
exports.deleteAddress = (userId, id) => transact(userId, ({ state }) => {
  state.addresses = state.addresses.filter((item) => item.id !== id);
  if (state.addresses.length && !state.addresses.some((item) => item.isDefault)) state.addresses[0].isDefault = true;
  return null;
});
exports.support = (userId, body) => transact(userId, ({ state, now }) => {
  if (!body.message?.trim() || body.message.trim().length < 10) fail('问题描述至少需要10个字');
  if (body.message.length > 500) fail('问题描述最多500字');
  if (body.orderId && !state.orders.some((order) => order.id === body.orderId)) throw new NotFoundError('订单不存在');
  state.support.unshift({ id: crypto.randomUUID(), kind: body.kind || '其他问题', message: body.message.trim(), orderId: body.orderId || '', status: '待处理', time: now });
  return null;
});
exports.checkIn = (userId) => transact(userId, ({ data, account, state, now }) => {
  const today = dayKey(now);
  if (state.checkIns.includes(today)) fail('今日已签到，明天再来吧');
  let streak = 0;
  while (state.checkIns.includes(dayKey(now - (streak + 1) * DAY))) streak += 1;
  const activity = data.activities.find((item) => item.id === 'bonus' && item.start <= now && now < item.end);
  const amount = data.settings.checkInPoints + (activity?.bonus || 0) + ((streak + 1) % 7 === 0 ? data.settings.sevenDayBonus : 0);
  state.checkIns.push(today);
  addLedger(account, state, `每日签到${activity?.bonus ? ' · 活动加赠' : ''}`, amount, now);
  return { amount };
});

exports.redeem = (userId, body) => transact(userId, async ({ tx, data, account, state, now }) => {
  if (!body.requestId) fail('缺少兑换标识，请重试');
  const old = state.orders.find((order) => order.requestId === body.requestId);
  if (old) return old;
  const product = data.products.find((item) => item.id === body.productId);
  if (!product) throw new NotFoundError('商品不存在');
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) fail('请选择有效数量');
  const activity = data.activities.find((item) => item.productIds.includes(product.id));
  if (activity && (now < activity.start || now >= activity.end)) fail('兑换活动尚未开始或已结束');
  if (quantity > product.stock) fail('商品库存不足');
  const used = state.orders.filter((order) => order.product.id === product.id && order.status !== 'cancelled' && !(order.status === 'expired' && order.product.type === 'physical')).reduce((sum, order) => sum + order.quantity, 0);
  if (used + quantity > product.limit) fail('已达到每人限兑数量');
  const subtotal = product.price * quantity;
  const coupon = body.couponId ? state.wallet.find((item) => item.id === body.couponId) : null;
  if (body.couponId && (!coupon || coupon.usedBy || coupon.expiresAt <= now || subtotal < coupon.minimum)) fail('抵扣券不可用或未达到使用门槛');
  const delivery = body.delivery || 'pickup';
  if (!['pickup', 'shipping'].includes(delivery) || (product.type === 'virtual' && delivery === 'shipping')) fail('配送方式不支持');
  const address = delivery === 'shipping' ? state.addresses.find((item) => item.id === body.addressId) : null;
  if (delivery === 'shipping' && !address) fail('请选择有效收货地址');
  const total = Math.max(0, subtotal - (coupon?.amount || 0));
  if (account.balance < total) fail('可用积分不足');
  const id = `GP${now}${crypto.randomUUID().slice(0, 6)}`;
  const order = { id, requestId: body.requestId, product, quantity, subtotal, discount: coupon?.amount || 0, couponId: coupon?.id || '', delivery, address: address ? { ...address } : null, total, time: now, expiresAt: now + (product.type === 'physical' ? 7 : 30) * DAY, status: product.type === 'physical' ? (delivery === 'shipping' ? 'shipping' : 'pending') : 'available', code: product.type === 'physical' ? String(crypto.randomInt(100000000)).padStart(8, '0') : crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase() };
  if (coupon) coupon.usedBy = id;
  await tx.greenPointsProduct.update({ where: { id: product.id }, data: { stock: { decrement: quantity } } });
  state.orders.unshift(order);
  addLedger(account, state, `兑换 · ${product.name}`, -total, now, id);
  return order;
});

const orderAction = (userId, id, complete) => transact(userId, async ({ tx, account, state, now }) => {
  const order = state.orders.find((item) => item.id === id);
  if (!order) throw new NotFoundError('订单不存在');
  if (complete) {
    if (!['pending', 'shipping', 'available'].includes(order.status)) fail('凭证已失效，不可使用');
    order.status = 'completed';
  } else {
    if (order.product.type !== 'physical') fail('虚拟商品发放后不可取消');
    if (!['pending', 'shipping'].includes(order.status)) fail('当前订单不可取消');
    order.status = 'cancelled';
    addLedger(account, state, '取消兑换退还', order.total, now, order.id);
    await tx.greenPointsProduct.update({ where: { id: order.product.id }, data: { stock: { increment: order.quantity } } });
    const coupon = state.wallet.find((item) => item.usedBy === order.id);
    if (coupon) coupon.usedBy = null;
  }
  return order;
});
exports.cancel = (userId, id) => orderAction(userId, id, false);
exports.complete = (userId, id) => orderAction(userId, id, true);

exports.asset = async (id) => {
  const asset = await db.greenPointsAsset.findUnique({ where: { id } });
  if (!asset) throw new NotFoundError('商城资源不存在');
  await storage.ensurePrivateBucket();
  return { stream: await storage.getMinioClient().getObject(storage.bucket, asset.objectKey), mimeType: asset.mimeType };
};
