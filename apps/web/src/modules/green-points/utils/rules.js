const DAY = 86400000;
export const dayKey = time => new Date(time + 8 * 3600000).toISOString().slice(0, 10);
export function checkInSummary(data, now = Date.now()) {
  const signed = data.checkIns.includes(dayKey(now));
  let streak = 0;
  while (data.checkIns.includes(dayKey(now - (streak + (signed ? 0 : 1)) * DAY))) streak++;
  const position = signed ? (streak - 1) % 7 + 1 : streak % 7;
  const bonus = data.activities.find(a => a.id === 'bonus' && a.start <= now && now < a.end)?.bonus || 0;
  return {
    signed,
    streak,
    position,
    bonus,
    reward: 10 + bonus + (!signed && position === 6 ? 30 : 0)
  };
}
export function redemptionIssue(data, product, quantity = 1, now = Date.now()) {
  if (!product) return '商品不存在';
  const activity = data.activities.find(a => a.productIds.includes(product.id));
  if (activity && (now < activity.start || now >= activity.end)) return '活动未开始或已结束';
  if (!Number.isInteger(quantity) || quantity < 1) return '请选择有效数量';
  if (product.stock < quantity) return '库存不足';
  const used = data.orders.filter(o => o.product.id === product.id && o.status !== 'cancelled' && !(o.status === 'expired' && o.product.type === 'physical')).reduce((n, o) => n + o.quantity, 0);
  if (used + quantity > product.limit) return '已达限兑数量';
  const discount = Math.max(0, ...(data.wallet || []).filter(c => !c.usedBy && c.expiresAt > now && product.price * quantity >= c.minimum).map(c => c.amount));
  if (data.balance < Math.max(0, product.price * quantity - discount)) return '可用积分不足';
  return '';
}
