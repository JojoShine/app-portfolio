const { ValidationError } = require('../../../common/utils/error');

const validateDevelopmentTokenRequest = (data = {}, { requireSecret = true } = {}) => {
  const errors = [];
  if (requireSecret && (typeof data.devSecret !== 'string' || !data.devSecret)) errors.push('devSecret is required');
  if (typeof data.userId !== 'string' || !data.userId.trim()) errors.push('userId is required');
  if (data.roles !== undefined && !Array.isArray(data.roles)) errors.push('roles must be an array');
  if (data.schoolIds !== undefined && !Array.isArray(data.schoolIds)) errors.push('schoolIds must be an array');

  if (errors.length) {
    throw new ValidationError('Validation failed', { errors });
  }
};

module.exports = { validateDevelopmentTokenRequest };
