const { ValidationError } = require('../../../common/utils/error');

const APP_STATUSES = ['active', 'developing', 'offline'];
const APP_FIELDS = ['name', 'description', 'icon', 'path', 'status', 'categoryId', 'isScenario', 'sort'];
const CATEGORY_FIELDS = ['name', 'sort'];

const pick = (source, fields) => fields.reduce((result, field) => {
  if (source[field] !== undefined) result[field] = source[field];
  return result;
}, {});

const validateApp = (data = {}, partial = false) => {
  const value = pick(data, APP_FIELDS);
  const errors = [];
  if (!partial || value.name !== undefined) {
    if (typeof value.name !== 'string' || !value.name.trim()) errors.push('name is required');
  }
  if (!partial || value.path !== undefined) {
    if (typeof value.path !== 'string' || !/^\/[a-z0-9][a-z0-9/_-]*$/i.test(value.path)) {
      errors.push('path must be an absolute application path');
    }
  }
  if (!partial || value.categoryId !== undefined) {
    if (typeof value.categoryId !== 'string' || !value.categoryId) errors.push('categoryId is required');
  }
  if (value.status !== undefined && !APP_STATUSES.includes(value.status)) errors.push('invalid status');
  if (value.isScenario !== undefined && typeof value.isScenario !== 'boolean') errors.push('isScenario must be boolean');
  if (value.sort !== undefined && !Number.isInteger(value.sort)) errors.push('sort must be an integer');

  if (errors.length) throw new ValidationError('Validation failed', { errors });
  return value;
};

const validateCategory = (data = {}, partial = false) => {
  const value = pick(data, CATEGORY_FIELDS);
  const errors = [];
  if (!partial || value.name !== undefined) {
    if (typeof value.name !== 'string' || !value.name.trim()) errors.push('name is required');
  }
  if (value.sort !== undefined && !Number.isInteger(value.sort)) errors.push('sort must be an integer');
  if (errors.length) throw new ValidationError('Validation failed', { errors });
  return value;
};

module.exports = { validateApp, validateCategory };
