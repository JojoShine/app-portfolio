const DAY = 86400000;
export const dayKey = time => new Date(time + 8 * 3600000).toISOString().slice(0, 10);
const fail = message => {
  throw new Error(message);
};
export function createState(now = Date.now()) {
  const products = [['cup', '轻量随行保温杯', 1280, 36, '生活好物', 'cup', '350mL · 304不锈钢 · 米白色'], ['bag', '城市环保帆布袋', 360, 58, '生活好物', 'bag', '天然棉布 · 可循环使用'], ['ticket', '城市影院观影券', 800, 42, '电子权益', 'ticket', '标准场次 · 单人使用'], ['book', '城市印记手账本', 520, 27, '文创周边', 'book', 'A5纸张 · 城市系列'], ['cup-set', '随行杯双人礼盒', 2480, 12, '生活好物', 'cup', '350mL × 2 · 米白色'], ['ticket-pair', '周末双人观影券', 1500, 18, '电子权益', 'ticket', '标准场次 · 双人使用'],
['coffee', '午后咖啡兑换券', 180, 120, '餐饮美食', 'voucher', '中杯美式 · 单杯兑换'],
['tea', '清香茶饮兑换券', 220, 86, '餐饮美食', 'voucher', '指定茶饮 · 单杯兑换'],
['bakery', '街角烘焙礼券', 300, 64, '餐饮美食', 'voucher', '指定面包 · 三件组合'],
['music', '音乐畅听月卡', 600, 99, '影音会员', 'ticket', '30天权益 · 单账号使用'],
['reading', '电子阅读月卡', 480, 75, '影音会员', 'book', '30天阅读 · 精选书库'],
['museum', '城市博物馆特展券', 680, 40, '出行休闲', 'ticket', '单人门票 · 需提前预约'],
['garden', '植物园漫游门票', 380, 52, '出行休闲', 'park', '日间入园 · 单人使用'],
['notebook', '口袋灵感随记本', 160, 95, '文创周边', 'book', 'A6纸张 · 空白内页'],
['bag-mini', '轻便棉布收纳袋', 199, 68, '生活好物', 'bag', '天然棉布 · 小号随身款'],
['gift-set', '绿色生活心意礼盒', 1980, 20, '生活好物', 'cup', '随行杯与帆布袋 · 礼盒装']].map(([id, name, price, stock, category, image, spec]) => ({
    id,
    name,
    price,
    stock,
    category,
    image,
    spec,
    type: ['生活好物', '文创周边'].includes(category) ? 'physical' : 'virtual',
    limit: 2,
    original: id === 'bag' ? 450 : null,
    activityId: id === 'bag' ? 'discount' : id === 'cup' ? 'limited' : null,
    description: `${name}，为日常添一份小确幸。${spec.replaceAll(' · ', '，')}。`,
    usage: `${spec}；适用于本商城演示合作门店或服务，兑换码仅用于体验。`,
    site: '青禾社区绿色服务站',
    address: '青禾路28号一层',
    hours: '周二至周日 09:00–18:00'
  }));
  return {
    version: 1,
    favorites: [], history: [], addresses: [], wallet: [], support: [],
    coupons: [
      { id: 'welcome', title: '新客见面礼', amount: 100, minimum: 500, days: 7 },
      { id: 'daily', title: '日常好物券', amount: 30, minimum: 199, days: 7 },
      { id: 'premium', title: '品质生活券', amount: 200, minimum: 1500, days: 14 }
    ],
    balance: 2680,
    products,
    orders: [],
    checkIns: [3, 2, 1].map(d => dayKey(now - d * DAY)),
    activities: [{
      id: 'limited',
      type: '限时兑换',
      title: '城市好礼限时兑',
      description: '精选生活好物，限量开放兑换',
      start: now - DAY,
      end: now + 6 * DAY,
      productIds: ['cup', 'book'],
      image: 'cup'
    }, {
      id: 'discount',
      type: '折扣兑换',
      title: '绿色生活折扣周',
      description: '好物积分8折，把绿色带回家',
      start: now - DAY,
      end: now + 11 * DAY,
      productIds: ['bag'],
      image: 'bag'
    }, {
      id: 'bonus',
      type: '签到加赠',
      title: '每日签到有加赠',
      description: '每天多一点奖励，绿色生活多一份心意',
      start: now - DAY,
      end: now + 7 * DAY,
      bonus: 5,
      productIds: [],
      image: 'park'
    }],
    ledger: [{
      id: 'opening',
      title: '绿色积分账户结余',
      amount: 2380,
      time: now - 10 * DAY
    }, ...['低碳出行奖励', '社区回收奖励', '环保志愿活动'].map((title, i) => ({
      id: `seed-${i}`,
      title,
      amount: 90,
      time: now - (6 - i) * DAY
    })), ...[3, 2, 1].map(d => ({
      id: `check-${d}`,
      title: '每日签到',
      amount: 10,
      time: now - d * DAY
    }))].sort((a, b) => b.time - a.time)
  };
}
const entry = (s, title, amount, time, orderId) => {
  s.balance += amount;
  s.ledger.unshift({
    id: crypto.randomUUID(),
    title,
    amount,
    time,
    orderId
  });
};
const restore = (s, o, now) => {
  entry(s, o.status === 'cancelled' ? '取消兑换退还' : '提货逾期退还', o.total, now, o.id);
  s.products.find(p => p.id === o.product.id).stock += o.quantity;
  const coupon = s.wallet?.find(c => c.usedBy === o.id);
  if (coupon) coupon.usedBy = null;
};
export function dispatch(s, action, body = {}, now = Date.now()) {
  for (const o of s.orders) if (['pending', 'shipping', 'available'].includes(o.status) && o.expiresAt <= now) {
    o.status = 'expired';
    if (o.product.type === 'physical') restore(s, o, now);
  }
  if (action === 'read') return s;
  if (action === 'favorite' || action === 'view') {
    if (!s.products.some(p => p.id === body.id)) fail('商品不存在');
    if (action === 'favorite') s.favorites = s.favorites.includes(body.id) ? s.favorites.filter(id => id !== body.id) : [...s.favorites, body.id];
    else s.history = [body.id, ...s.history.filter(id => id !== body.id)].slice(0, 30);
    return s;
  }
  if (action === 'claim-coupon') {
    const coupon = s.coupons.find(c => c.id === body.id);
    if (!coupon) fail('抵扣券不存在');
    if (s.wallet.some(c => c.id === body.id)) fail('已经领取过这张抵扣券');
    s.wallet.push({ ...coupon, expiresAt: now + coupon.days * DAY, usedBy: null });
    return s;
  }
  if (action === 'save-address') {
    if (!body.name?.trim()) fail('请填写收货人');
    if (!/^1[3-9]\d{9}$/.test(body.phone || '')) fail('请填写正确的手机号');
    if (!body.detail?.trim() || body.detail.trim().length < 8) fail('请填写完整的省市区及详细地址');
    if (body.id && !s.addresses.some(a => a.id === body.id)) fail('地址不存在');
    const a = { id: body.id || crypto.randomUUID(), name: body.name.trim(), phone: body.phone, detail: body.detail.trim(), isDefault: Boolean(body.isDefault) || !s.addresses.length };
    if (a.isDefault) s.addresses.forEach(item => { item.isDefault = false; });
    s.addresses = [...s.addresses.filter(item => item.id !== a.id), a];
    return a;
  }
  if (action === 'delete-address') {
    s.addresses = s.addresses.filter(a => a.id !== body.id);
    if (s.addresses.length && !s.addresses.some(a => a.isDefault)) s.addresses[0].isDefault = true;
    return s;
  }
  if (action === 'support') {
    if (!body.message?.trim() || body.message.trim().length < 10) fail('问题描述至少需要10个字');
    if (body.message.length > 500) fail('问题描述最多500字');
    if (body.orderId && !s.orders.some(o => o.id === body.orderId)) fail('订单不存在');
    s.support.unshift({ id: crypto.randomUUID(), kind: body.kind || '其他问题', message: body.message.trim(), orderId: body.orderId || '', status: '待处理', time: now });
    return s;
  }
  if (action === 'check-in') {
    const today = dayKey(now);
    if (s.checkIns.includes(today)) fail('今日已签到，明天再来吧');
    let streak = 0;
    while (s.checkIns.includes(dayKey(now - (streak + 1) * DAY))) streak++;
    const bonus = s.activities.find(a => a.id === 'bonus' && a.start <= now && now < a.end)?.bonus || 0;
    const amount = 10 + bonus + ((streak + 1) % 7 === 0 ? 30 : 0);
    s.checkIns.push(today);
    entry(s, '每日签到' + (bonus ? ' · 活动加赠' : ''), amount, now);
    return {
      amount
    };
  }
  if (action === 'redeem') {
    if (!body.requestId) fail('缺少兑换标识，请重试');
    const old = s.orders.find(o => o.requestId === body.requestId);
    if (old) {
      if (old.product.id !== body.productId || old.quantity !== body.quantity || (old.couponId || '') !== (body.couponId || '') || (old.delivery || 'pickup') !== (body.delivery || 'pickup') || (old.address?.id || '') !== (body.addressId || '')) fail('重复请求内容不一致');
      return old;
    }
    const p = s.products.find(p => p.id === body.productId);
    if (!p) fail('商品不存在');
    const q = body.quantity;
    if (!Number.isInteger(q) || q < 1) fail('请选择有效数量');
    const a = s.activities.find(a => a.productIds.includes(p.id));
    if (a && (now < a.start || now >= a.end)) fail('兑换活动尚未开始或已结束');
    if (q > p.stock) fail('商品库存不足');
    const used = s.orders.filter(o => o.product.id === p.id && o.status !== 'cancelled' && !(o.status === 'expired' && o.product.type === 'physical')).reduce((sum, o) => sum + o.quantity, 0);
    if (used + q > p.limit) fail('已达到每人限兑数量');
    const subtotal = p.price * q;
    const coupon = body.couponId ? s.wallet.find(c => c.id === body.couponId) : null;
    if (body.couponId && (!coupon || coupon.usedBy || coupon.expiresAt <= now || subtotal < coupon.minimum)) fail('抵扣券不可用或未达到使用门槛');
    const delivery = body.delivery || 'pickup';
    if (!['pickup', 'shipping'].includes(delivery) || (p.type === 'virtual' && delivery === 'shipping')) fail('配送方式不支持');
    const address = delivery === 'shipping' ? s.addresses.find(a => a.id === body.addressId) : null;
    if (delivery === 'shipping' && !address) fail('请选择有效收货地址');
    const total = Math.max(0, subtotal - (coupon?.amount || 0));
    if (s.balance < total) fail('可用积分不足');
    const id = `GP${now}${crypto.randomUUID().slice(0, 6)}`;
    const o = {
      id,
      requestId: body.requestId,
      product: {
        ...p
      },
      quantity: q,
      subtotal, discount: coupon?.amount || 0, couponId: coupon?.id || '',
      delivery, address: address ? { ...address } : null,
      total,
      time: now,
      expiresAt: now + (p.type === 'physical' ? 7 : 30) * DAY,
      status: p.type === 'physical' ? delivery === 'shipping' ? 'shipping' : 'pending' : 'available',
      code: p.type === 'physical' ? String(crypto.getRandomValues(new Uint32Array(1))[0] % 100000000).padStart(8, '0') : crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()
    };
    if (coupon) coupon.usedBy = id;
    p.stock -= q;
    s.orders.unshift(o);
    entry(s, `兑换 · ${p.name}`, -total, now, id);
    return o;
  }
  const o = s.orders.find(o => o.id === body.id);
  if (!o) fail('订单不存在');
  if (action === 'cancel') {
    if (o.product.type !== 'physical') fail('虚拟商品发放后不可取消');
    if (o.status === 'cancelled') return o;
    if (!['pending', 'shipping'].includes(o.status)) fail('当前订单不可取消');
    o.status = 'cancelled';
    restore(s, o, now);
    return o;
  }
  if (action === 'complete') {
    if (!['pending', 'shipping', 'available'].includes(o.status)) fail('凭证已失效，不可使用');
    o.status = 'completed';
    return o;
  }
  fail('操作不存在');
}

export function upgradeState(s, now = Date.now()) {
  const seed = createState(now);
  for (const key of ['favorites', 'history', 'addresses', 'wallet', 'support', 'coupons']) s[key] ??= seed[key];
  for (const p of seed.products) {
    const old = s.products.find(item => item.id === p.id);
    if (!old) s.products.push(p);
    else { old.usage ??= p.usage; }
  }
  return s;
}
