const db = require('../db');
const { NotFoundError } = require('../../../common/utils/error');
const mapActivity = (item) => ({ ...item, status: Date.now() < item.startsAt.getTime() ? 'upcoming' : Date.now() >= item.endsAt.getTime() ? 'ended' : item.status, tickets: item.tickets.map(({ remaining, ...ticket }) => ({ ...ticket, stock: remaining === 0 ? '已抢光' : remaining < 20 ? '紧张' : '充足' })) });
exports.list = async () => (await db.couponActivity.findMany({ include: { tickets: true }, orderBy: { startsAt: 'asc' } })).map(mapActivity);
exports.get = async (id) => {
  const item = await db.couponActivity.findUnique({ where: { id }, include: { tickets: true } });
  if (!item) throw new NotFoundError('活动不存在');
  return mapActivity(item);
};
