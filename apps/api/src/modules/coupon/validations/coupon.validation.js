const { ValidationError } = require('../../../common/utils/error');
const identifier = (value, label) => {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(value)) throw new ValidationError(`${label}格式不正确`);
  return value;
};
exports.id = (value) => identifier(value, '编号');
exports.claim = (body) => ({ ticketId: identifier(body?.ticketId, '券种') });
exports.verification = (body, confirm = false) => {
  if (typeof body?.code !== 'string' || !/^\d{8}$/.test(body.code)) throw new ValidationError('请输入8位数字券码');
  return { code: body.code, storeId: identifier(body.storeId, '门店'), ...(confirm ? { requestId: identifier(body.requestId, '请求标识') } : {}) };
};
