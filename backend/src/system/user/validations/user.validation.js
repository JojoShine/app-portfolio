const { ValidationError } = require('../../../common/utils/error');

const USER_FIELDS = ['username', 'email', 'phone', 'avatar', 'status'];
const pickUserFields = (data) => USER_FIELDS.reduce((result, field) => {
  if (data[field] !== undefined) result[field] = data[field];
  return result;
}, {});

const validateCreateUser = (data) => {
  const value = pickUserFields(data);
  const errors = [];

  if (!value.username || typeof value.username !== 'string') {
    errors.push('username is required and must be a string');
  } else if (value.username.length < 3 || value.username.length > 50) {
    errors.push('username must be between 3 and 50 characters');
  }

  if (!value.email || typeof value.email !== 'string') {
    errors.push('email is required and must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
    errors.push('email must be a valid email address');
  }

  if (value.phone && typeof value.phone !== 'string') errors.push('phone must be a string');
  if (value.avatar !== undefined && typeof value.avatar !== 'string') errors.push('avatar must be a string');
  if (value.status !== undefined && !['active', 'inactive', 'banned'].includes(value.status)) {
    errors.push('invalid status');
  }

  if (errors.length > 0) throw new ValidationError('Validation failed', { errors });
  return value;
};

const validateUpdateUser = (data) => {
  const value = pickUserFields(data);
  const errors = [];

  if (value.username !== undefined) {
    if (typeof value.username !== 'string') {
      errors.push('username must be a string');
    } else if (value.username.length < 3 || value.username.length > 50) {
      errors.push('username must be between 3 and 50 characters');
    }
  }

  if (value.email !== undefined) {
    if (typeof value.email !== 'string') {
      errors.push('email must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
      errors.push('email must be a valid email address');
    }
  }

  if (value.phone !== undefined && typeof value.phone !== 'string') errors.push('phone must be a string');
  if (value.avatar !== undefined && typeof value.avatar !== 'string') errors.push('avatar must be a string');

  if (value.status !== undefined) {
    const validStatuses = ['active', 'inactive', 'banned'];
    if (!validStatuses.includes(value.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) throw new ValidationError('Validation failed', { errors });
  return value;
};

module.exports = { validateCreateUser, validateUpdateUser };
