const { ValidationError } = require('../../../common/utils/error');

const fail = (message) => { throw new ValidationError(message); };
const integer = (value, fallback) => value === undefined ? fallback : Number.parseInt(value, 10);

const bookQuery = (query = {}) => {
  const page = integer(query.page, 1);
  const pageSize = integer(query.pageSize, 20);
  if (!Number.isInteger(page) || page < 1) fail('页码必须大于 0');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) fail('每页数量必须在 1 到 100 之间');
  const availability = query.availability || undefined;
  if (availability && !['available', 'unavailable'].includes(availability)) fail('馆藏状态不合法');
  const sort = query.sort || 'relevance';
  if (!['relevance', 'popular', 'newest'].includes(sort)) fail('排序方式不合法');
  return {
    q: String(query.q || '').trim() || undefined,
    page,
    pageSize,
    availability,
    branchId: query.branchId || undefined,
    category: query.category || undefined,
    sort,
  };
};

const required = (body, fields) => {
  const result = {};
  for (const field of fields) {
    if (body?.[field] === undefined || body[field] === null || body[field] === '') fail(`${field} 不能为空`);
    result[field] = body[field];
  }
  return result;
};

module.exports = { bookQuery, required };
