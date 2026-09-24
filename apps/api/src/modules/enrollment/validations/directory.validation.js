const { ValidationError } = require('../../../common/utils/error');

const text = (value, label, max = 500) => {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > max) throw new ValidationError(`${label}格式不正确`);
  return value.trim();
};
exports.district = (query) => {
  const keyword = text(query.keyword, '地址');
  const regionId = text(query.regionId, '学区', 80);
  if (keyword && keyword.length < 2) throw new ValidationError('请输入至少 2 个字的小区、道路或详细地址');
  return { keyword, regionId };
};
exports.propertyDegree = (query) => {
  const type = query.type || 'address';
  if (!['address', 'certificate'].includes(type)) throw new ValidationError('查询方式不正确');
  const keyword = text(query.keyword, type === 'address' ? '房产地址' : '产权证号');
  if (keyword.length < 2) throw new ValidationError('请填写完整房产地址或产权证号');
  return { type, keyword };
};
exports.applicationId = (id) => {
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)) throw new ValidationError('报名编号格式不正确');
  return id;
};
