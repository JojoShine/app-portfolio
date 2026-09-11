const db = require('../db');
const { NotFoundError, ConflictError } = require('../../../common/utils/error');
const include = { ticket: { include: { activity: true } } };
const mapCoupon = (item) => ({ id: item.id, ticketId: item.ticketId, name: item.ticket.name, value: item.ticket.value, unit: item.ticket.unit, rule: item.ticket.rule, type: item.ticket.type, days: item.ticket.days, activityName: item.ticket.activity.name, category: item.ticket.activity.category, region: item.ticket.activity.region, status: item.status === 'available' && item.expiresAt <= new Date() ? 'expired' : item.status, expiresAt: item.expiresAt });
exports.mapCoupon = mapCoupon;
exports.list = async (userId) => (await db.couponWallet.findMany({ where: { userId }, include, orderBy: { createdAt: 'desc' } })).map(mapCoupon);
exports.get = async (id, userId) => {
  const item = await db.couponWallet.findFirst({ where: { id, userId }, include });
  if (!item) throw new NotFoundError('消费券不存在');
  return mapCoupon(item);
};
exports.claim = async (ticketId, userId) => {
  try {
    return await db.$transaction(async (tx) => {
      const ticket = await tx.couponTicket.findUnique({ where: { id: ticketId }, include: { activity: true } });
      if (!ticket) throw new NotFoundError('券种不存在');
      const now = new Date();
      if (ticket.activity.startsAt > now || ticket.activity.status === 'upcoming') throw new ConflictError('活动尚未开始');
      if (ticket.activity.endsAt <= now || ticket.activity.status !== 'active') throw new ConflictError('活动已结束');
      const stock = await tx.couponTicket.updateMany({ where: { id: ticketId, remaining: { gt: 0 } }, data: { remaining: { decrement: 1 } } });
      if (!stock.count) throw new ConflictError('本批次已抢光');
      const item = await tx.couponWallet.create({ data: { userId, ticketId, expiresAt: new Date(now.getTime() + ticket.days * 86400000) }, include });
      return mapCoupon(item);
    });
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError('每种券限领一张，您已领取');
    throw error;
  }
};
