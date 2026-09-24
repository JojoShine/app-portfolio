const products = [
  ['cup', '轻量随行保温杯', 1280, 36, '生活好物', 'physical', 'cup', '350mL · 304不锈钢 · 米白色'],
  ['bag', '城市环保帆布袋', 360, 58, '生活好物', 'physical', 'bag', '天然棉布 · 可循环使用'],
  ['ticket', '城市影院观影券', 800, 42, '电子权益', 'virtual', 'ticket', '标准场次 · 单人使用'],
  ['book', '城市印记手账本', 520, 27, '文创周边', 'physical', 'book', 'A5纸张 · 城市系列'],
  ['cup-set', '随行杯双人礼盒', 2480, 12, '生活好物', 'physical', 'cup', '350mL × 2 · 米白色'],
  ['ticket-pair', '周末双人观影券', 1500, 18, '电子权益', 'virtual', 'ticket', '标准场次 · 双人使用'],
  ['coffee', '午后咖啡兑换券', 180, 120, '餐饮美食', 'virtual', 'voucher', '中杯美式 · 单杯兑换'],
  ['tea', '清香茶饮兑换券', 220, 86, '餐饮美食', 'virtual', 'voucher', '指定茶饮 · 单杯兑换'],
  ['bakery', '街角烘焙礼券', 300, 64, '餐饮美食', 'virtual', 'voucher', '指定面包 · 三件组合'],
  ['music', '音乐畅听月卡', 600, 99, '影音会员', 'virtual', 'ticket', '30天权益 · 单账号使用'],
  ['reading', '电子阅读月卡', 480, 75, '影音会员', 'virtual', 'book', '30天阅读 · 精选书库'],
  ['museum', '城市博物馆特展券', 680, 40, '出行休闲', 'virtual', 'ticket', '单人门票 · 需提前预约'],
  ['garden', '植物园漫游门票', 380, 52, '出行休闲', 'virtual', 'park', '日间入园 · 单人使用'],
  ['notebook', '口袋灵感随记本', 160, 95, '文创周边', 'physical', 'book', 'A6纸张 · 空白内页'],
  ['bag-mini', '轻便棉布收纳袋', 199, 68, '生活好物', 'physical', 'bag', '天然棉布 · 小号随身款'],
  ['gift-set', '绿色生活心意礼盒', 1980, 20, '生活好物', 'physical', 'cup', '随行杯与帆布袋 · 礼盒装'],
];

const assets = [
  ['cup', 'green-points/cup.png', 'image/png'], ['bag', 'green-points/bag.png', 'image/png'],
  ['ticket', 'green-points/ticket.png', 'image/png'], ['book', 'green-points/book.png', 'image/png'],
  ['park', 'green-points/park.png', 'image/png'], ['voucher', 'green-points/voucher.png', 'image/png'],
];

async function seedGreenPoints(prisma) {
  for (const [id, objectKey, mimeType] of assets) {
    await prisma.greenPointsAsset.upsert({ where: { id }, update: {}, create: { id, objectKey, mimeType } });
  }
  let sort = 1;
  for (const [id, name, price, stock, category, type, imageAssetId, spec] of products) {
    const data = {
      name, price, stock, category, type, imageAssetId, spec, limit: 2, sort: sort++,
      original: id === 'bag' ? 450 : null,
      activityId: id === 'bag' ? 'discount' : id === 'cup' ? 'limited' : null,
      description: `${name}，为日常添一份小确幸。${spec.replaceAll(' · ', '，')}。`,
      usage: `${spec}；适用于本商城演示合作门店或服务，兑换码仅用于体验。`,
      site: '青禾社区绿色服务站', address: '青禾路28号一层', hours: '周二至周日 09:00–18:00',
    };
    await prisma.greenPointsProduct.upsert({ where: { id }, update: {}, create: { id, ...data } });
  }
  for (const [id, title, amount, minimum, days, couponSort] of [
    ['welcome', '新客见面礼', 100, 500, 7, 1], ['daily', '日常好物券', 30, 199, 7, 2], ['premium', '品质生活券', 200, 1500, 14, 3],
  ]) await prisma.greenPointsCoupon.upsert({ where: { id }, update: {}, create: { id, title, amount, minimum, days, sort: couponSort } });

  const activities = [
    ['limited', '限时兑换', '城市好礼限时兑', '精选生活好物，限量开放兑换', ['cup', 'book'], 'cup', 0, 1],
    ['discount', '折扣兑换', '绿色生活折扣周', '好物积分8折，把绿色带回家', ['bag'], 'bag', 0, 2],
    ['bonus', '签到加赠', '每日签到有加赠', '每天多一点奖励，绿色生活多一份心意', [], 'park', 5, 3],
  ];
  for (const [id, type, title, description, productIds, imageAssetId, bonus, activitySort] of activities) {
    await prisma.greenPointsActivity.upsert({ where: { id }, update: {}, create: {
      id, type, title, description, productIds, imageAssetId, bonus, sort: activitySort,
      startsAt: new Date('2026-01-01T00:00:00+08:00'), endsAt: new Date('2027-01-01T00:00:00+08:00'),
    } });
  }
  await prisma.greenPointsConfig.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default', settings: {
    initialBalance: 2680, openingBalance: 2380, checkInPoints: 10, sevenDayBonus: 30,
    categories: ['全部', '生活好物', '电子权益', '餐饮美食', '影音会员', '出行休闲', '文创周边'],
  } } });
}

async function seedGreenPointsAssets(assetStore) {
  const sourceDir = path.resolve(__dirname, 'assets/green-points');
  for (const [, objectKey, mimeType] of assets) {
    await assetStore.uploadFile({ objectKey, sourcePath: path.join(sourceDir, path.basename(objectKey)), mimeType });
  }
}

module.exports = { seedData: seedGreenPoints, seedAssets: seedGreenPointsAssets };
const path = require('node:path');
