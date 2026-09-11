const { randomInt } = require('node:crypto');
const db = require('../db');
const { ConflictError, ForbiddenError, NotFoundError } = require('../../../common/utils/error');
const { mapCoupon } = require('./wallet.service');
const include = { ticket: { include: { activity: true } } };
const publicStore = ({ operatorId, ...store }) => store;
const recordView = (record) => ({ id: record.id, requestId: record.requestId, code: record.code, createdAt: record.createdAt, method: '手工券码', user: '已认证用户', coupon: mapCoupon(record.coupon), store: publicStore(record.store) });
async function authorizeStore(client, storeId, operatorId) {
  const store = await client.couponMerchant.findUnique({ where: { id: storeId } });
  if (!store || store.operatorId !== operatorId) throw new ForbiddenError('无权操作当前门店');
  return store;
}
async function preview(client, code, storeId, operatorId) {
  const store = await authorizeStore(client, storeId, operatorId);
  const item = await client.couponWallet.findUnique({ where: { code }, include });
  if (!item || !item.codeExpires || item.codeExpires <= new Date()) throw new ConflictError('券码已过期，请用户重新出示');
  if (item.status !== 'available' || item.expiresAt <= new Date()) throw new ConflictError('该券已使用或已过期');
  const activity = item.ticket.activity;
  if (store.category !== activity.category || (activity.region !== '盐城市' && store.region !== activity.region)) throw new ConflictError('当前门店不适用该消费券');
  return { coupon: mapCoupon(item), store: publicStore(store), user: '已认证用户', code };
}
exports.credential = async (id, userId) => {
  const item = await db.couponWallet.findFirst({ where: { id, userId } });
  if (!item) throw new NotFoundError('消费券不存在');
  const expiresAt = new Date(Date.now() + 60000);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = String(randomInt(0, 100000000)).padStart(8, '0');
    try {
      const changed = await db.couponWallet.updateMany({ where: { id, userId, status: 'available', expiresAt: { gt: new Date() } }, data: { code, codeExpires: expiresAt } });
      if (!changed.count) throw new ConflictError('当前消费券不可使用');
      return { code, expiresAt: expiresAt.getTime() };
    } catch (error) { if (error.code !== 'P2002') throw error; }
  }
  throw new ConflictError('凭证生成繁忙，请重试');
};
exports.preview = (input, operatorId) => preview(db, input.code, input.storeId, operatorId);
exports.confirm = async (input, operatorId) => {
  try {
    return await db.$transaction(async (tx) => {
      await authorizeStore(tx, input.storeId, operatorId);
      const existing = await tx.couponVerification.findUnique({ where: { requestId: input.requestId }, include: { coupon: { include }, store: true } });
      if (existing) {
        if (existing.storeId !== input.storeId || existing.code !== input.code || existing.operatorId !== operatorId) throw new ConflictError('重复请求参数不一致');
        return recordView(existing);
      }
      const checked = await preview(tx, input.code, input.storeId, operatorId);
      const changed = await tx.couponWallet.updateMany({ where: { id: checked.coupon.id, code: input.code, codeExpires: { gt: new Date() }, status: 'available', expiresAt: { gt: new Date() } }, data: { status: 'used' } });
      if (!changed.count) throw new ConflictError('消费券状态已变化，请重新校验');
      return recordView(await tx.couponVerification.create({ data: { couponId: checked.coupon.id, storeId: input.storeId, operatorId, code: input.code, requestId: input.requestId }, include: { coupon: { include }, store: true } }));
    });
  } catch (error) { if (error.code === 'P2002') throw new ConflictError('该消费券已核销'); throw error; }
};
exports.list = async (storeId, operatorId) => {
  await authorizeStore(db, storeId, operatorId);
  return (await db.couponVerification.findMany({ where: { storeId }, include: { coupon: { include }, store: true }, orderBy: { createdAt: 'desc' } })).map(recordView);
};
