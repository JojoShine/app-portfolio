const { ConflictError } = require('../../../common/utils/error');

const getRenewalBlockReason = (loan, now = new Date()) => {
  if (loan.readerStatus !== 'active') return '读者证状态异常';
  if (loan.renewalCount >= 1) return '已达到续借次数上限';
  if (loan.hasQueue) return '已有其他读者预约';
  if (new Date(loan.dueAt) <= now || loan.status === 'overdue') return '图书已逾期';
  if (loan.status && loan.status !== 'borrowed') return '当前借阅状态不支持续借';
  return null;
};

const getRenewedDueAt = (loan, now = new Date()) => {
  const blockedReason = getRenewalBlockReason(loan, now);
  if (blockedReason) throw new ConflictError(`${blockedReason}，暂不可续借`);
  const dueAt = new Date(loan.dueAt);
  dueAt.setUTCDate(dueAt.getUTCDate() + 30);
  return dueAt;
};

const hasTimeConflict = (reservations, startsAt, endsAt) => reservations.some((reservation) => (
  new Date(reservation.startsAt) < endsAt && new Date(reservation.endsAt) > startsAt
));

module.exports = { getRenewalBlockReason, getRenewedDueAt, hasTimeConflict };
