const { ValidationError } = require('../../common/utils/error');

// 创建用户验证
const validateCreateUser = (data) => {
  const errors = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('username is required and must be a string');
  } else if (data.username.length < 3 || data.username.length > 50) {
    errors.push('username must be between 3 and 50 characters');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required and must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email must be a valid email address');
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.push('phone must be a string');
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', { errors });
  }

  return true;
};

// 更新用户验证
const validateUpdateUser = (data) => {
  const errors = [];

  if (data.username !== undefined) {
    if (typeof data.username !== 'string') {
      errors.push('username must be a string');
    } else if (data.username.length < 3 || data.username.length > 50) {
      errors.push('username must be between 3 and 50 characters');
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('email must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('email must be a valid email address');
    }
  }

  if (data.phone !== undefined && typeof data.phone !== 'string') {
    errors.push('phone must be a string');
  }

  if (data.status !== undefined) {
    const validStatuses = ['active', 'inactive', 'banned'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', { errors });
  }

  return true;
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
