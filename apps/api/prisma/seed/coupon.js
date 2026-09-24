'use strict';

async function seedCoupon(prisma) {
  const activities = [
    ['dining', '餐饮', '建湖县', '餐饮惠民演示活动', '50', '满200元可用'],
    ['shopping', '商超', '盐城市', '商超惠民演示活动', '30', '满150元可用'],
    ['travel', '文旅', '建湖县', '文旅惠民演示活动', '20', '满100元可用'],
    ['appliance', '家电', '盐城市', '家电惠民演示活动', '100', '满1000元可用'],
  ];
  for (const [key, category, region, name, value, rule] of activities) {
    const id = `demo-${key}`;
    await prisma.couponActivity.upsert({ where: { id }, update: {}, create: {
      id, name: `${name}（仅演示）`, category, region, subtitle: '数据库示例，不具备真实消费权益',
      status: 'active', batches: ['演示批次开放领取'],
      startsAt: new Date('2026-01-01T00:00:00Z'), endsAt: new Date('2030-12-31T15:59:59Z'),
    } });
    await prisma.couponTicket.upsert({ where: { id: `${id}-ticket` }, update: {}, create: {
      id: `${id}-ticket`, activityId: id, name: `${category}演示券`, value, unit: '元', rule,
      type: '满减券', days: 7, remaining: 100,
    } });
    await prisma.couponMerchant.upsert({ where: { id: `${id}-store` }, update: {}, create: {
      id: `${id}-store`, name: `${category}演示门店（虚构）`, category, region,
      address: `${region}演示街区（非真实商户）`, hours: '演示时段 09:00–21:00', phone: '',
      operatorId: 'demo-coupon-operator', status: '营业中',
    } });
  }
}

module.exports = { seedCoupon };
