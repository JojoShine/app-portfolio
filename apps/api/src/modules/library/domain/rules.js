const { ConflictError } = require('../../../common/utils/error');

const getRenewedDueAt = (loan, now = new Date()) => {
  if (loan.readerStatus !== 'active') throw new ConflictError('读者证状态异常，暂不可续借');
  if (loan.renewalCount >= 1) throw new ConflictError('已达到最大续借次数');
  if (loan.hasQueue) throw new ConflictError('该书已有其他读者预约，暂不可续借');
  const dueAt = new Date(loan.dueAt);
  if (dueAt <= now) throw new ConflictError('图书已逾期，暂不可续借');
  dueAt.setUTCDate(dueAt.getUTCDate() + 30);
  return dueAt;
};

const hasTimeConflict = (reservations, startsAt, endsAt) => reservations.some((reservation) => (
  new Date(reservation.startsAt) < endsAt && new Date(reservation.endsAt) > startsAt
));

module.exports = { getRenewedDueAt, hasTimeConflict };
