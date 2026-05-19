const { ValidationError } = require('../../common/utils/error');

// 获取token验证
const validateGetToken = (data) => {
  const errors = [];

  if (!data.appId || typeof data.appId !== 'string') {
    errors.push('appId is required and must be a string');
  }

  if (!data.moduleName || typeof data.moduleName !== 'string') {
    errors.push('moduleName is required and must be a string');
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', { errors });
  }

  return true;
};

// 刷新token验证
const validateRefreshToken = (data) => {
  const errors = [];

  if (!data.refreshToken || typeof data.refreshToken !== 'string') {
    errors.push('refreshToken is required and must be a string');
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', { errors });
  }

  return true;
};

module.exports = {
  validateGetToken,
  validateRefreshToken,
};