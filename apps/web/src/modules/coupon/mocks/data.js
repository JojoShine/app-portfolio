export const nextBatchAt = '2026-09-12T10:00:00+08:00';
export const activities = [
  { id: 'dining', name: '建湖金秋餐饮消费券', category: '餐饮', region: '建湖县', subtitle: '品湖鲜美食，享烟火建湖', status: 'active', batches: ['本批次开放领取', '下一批：9月12日 10:00'], tickets: [
    { id: 'dining-30', name: '建湖金秋餐饮券', threshold: '100', value: '30', unit: '元', rule: '满100元可用', type: '满减券', stock: '充足', days: 7 },
    { id: 'dining-60', name: '建湖金秋餐饮券', value: '60', threshold: '200', unit: '元', rule: '满200元可用', type: '满减券', stock: '充足', days: 7 },
    { id: 'dining-10', name: '餐饮代金券', value: '10', unit: '元', rule: '无门槛使用', type: '代金券', stock: '紧张', days: 7 },
  ] },
  { id: 'shopping', name: '盐城品质商超消费券', category: '商超', region: '盐城市', subtitle: '日常好物，惠享生活', status: 'active', batches: ['本批次开放领取'], tickets: [
    { id: 'shopping-80', name: '商超折扣券', value: '8', unit: '折', rule: '最高优惠50元', type: '折扣券', stock: '充足', days: 7 },
  ] },
  { id: 'travel', name: '建湖湿地文旅消费券', category: '文旅', region: '建湖县', subtitle: '走进湿地，遇见自然', status: 'active', batches: ['本批次开放领取'], tickets: [
    { id: 'travel-1', name: '湿地游览体验券', value: '1', unit: '次', rule: '指定湿地游览项目可用', type: '品类券', stock: '充足', days: 7 },
  ] },
  { id: 'appliance', name: '盐城绿色家电消费券', category: '家电', region: '盐城市', subtitle: '焕新家电，焕新生活', status: 'upcoming', batches: ['下一批：9月12日 10:00'], tickets: [
    { id: 'appliance-100', name: '家电满减券', value: '100', unit: '元', rule: '满1000元可用', type: '满减券', stock: '充足', days: 7 },
  ] },
];
export const merchants = [
  { id: 'store-1', mapPosition: { x: 46, y: 21 }, name: '建湖八大碗 · 新洋店', shortName: '建湖八大碗', branch: '新洋店', image: 'merchant-food', distance: '1.2', category: '餐饮', region: '建湖县', address: '建湖县新洋路128号（新洋广场东侧）', hours: '08:30—21:00', phone: '', status: '营业中' },
  { id: 'store-2', mapPosition: { x: 70, y: 45 }, name: '海盐生活超市 · 城南店', category: '商超', region: '盐城市', address: '盐城市世纪大道28号（演示地址）', hours: '08:00—22:00', phone: '', status: '营业中' },
  { id: 'store-3', mapPosition: { x: 33, y: 44 }, name: '湿地时光 · 建湖游客中心', category: '文旅', region: '建湖县', address: '建湖县湿地路6号（演示地址）', hours: '09:00—17:00', phone: '', status: '营业中' },
];

activities[0].batchRows = [
  { name: '第一轮', date: '09.10 10:00', stock: '库存充足' },
  { name: '第二轮', date: '09.17 10:00', stock: '库存紧张' },
  { name: '第三轮', date: '09.24 10:00', stock: '库存充足' },
  { name: '第四轮', date: '10.01 10:00', stock: '已抢光' },
];
merchants.push({ id: 'store-4', mapPosition: { x: 59, y: 31 }, name: '淮扬人家 · 建湖店', shortName: '淮扬人家', branch: '建湖店', category: '餐饮', region: '建湖县', address: '建湖县湖中南路66号', hours: '10:00—21:30', phone: '', status: '营业中', image: 'merchant-shop', distance: '2.8' });
export function createDemoState() {
  const validUntil = new Date(Date.now() + 30 * 86400000).toISOString();
  const wallet = [
    { id: 'demo-dining', ticketId: 'demo-dining', name: '建湖金秋餐饮券', activityName: '建湖金秋餐饮消费券', value: '30', threshold: '100', unit: '元', rule: '满100元可用', type: '满减券', category: '餐饮', region: '建湖县', subtitle: '品味湖鲜 · 尽享金秋', scope: '限盐城市内指定餐饮商户使用', status: 'available', expiresAt: validUntil },
    { id: 'demo-travel', ticketId: 'demo-travel', name: '盐城文旅抵用券', activityName: '盐城文旅消费券', value: '50', unit: '元', rule: '指定景区、文旅场馆使用', type: '代金券', category: '文旅', region: '盐城市', subtitle: '遇见湿地 · 畅游盐城', scope: '限全市A级旅游景区、文旅场馆使用', status: 'available', expiresAt: validUntil },
    { id: 'demo-appliance', ticketId: 'demo-appliance', name: '家电焕新折扣券', activityName: '绿色家电消费券', value: '8.5', unit: '折', rule: '最高减200元', type: '折扣券', category: '家电', region: '盐城市', subtitle: '绿色焕新 · 品质生活', scope: '限盐城市指定家电卖场使用', status: 'available', expiresAt: validUntil },
  ];
  const records = Array.from({ length: 326 }, (_, index) => { const user = ['李**', '王**', '张**', '陈**'][index % 4]; return ({ id: `HX2026091800${28 - index}`, requestId: `demo-record-${index}`, coupon: { ...wallet[0], id: `archived-${index}`, status: 'used' }, store: merchants[0], user, code: `0000000${index}`, createdAt: new Date(new Date().setHours(index < 18 ? Math.max(0, 14 - index) : -24 * (1 + Math.floor((index - 18) / 18)), index < 4 ? [24, 17, 3, 46][index] : 0, 0, 0)).toISOString(), method: '动态二维码' }); });
  const otherCoupons = [0, 1].map((index) => ({ ...wallet[0], id: `merchant-demo-coupon-${index}`, status: 'pending' }));
  const requests = otherCoupons.map((item, index) => ({ id: `SQ2026091800${21 + index}`, coupon: item, store: merchants[0], user: index ? '王**' : '李**', status: 'pending', createdAt: new Date(Date.now() - (index ? 24000 : 228000)).toISOString(), expiresAt: Date.now() + (index ? 276000 : 72000) }));
  return { wallet, records, requests, otherCoupons, credentials: [], historyVersion: 2 };
}
