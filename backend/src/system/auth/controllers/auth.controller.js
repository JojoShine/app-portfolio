const crypto = require('crypto');
const env = require('../../../config/env');
const response = require('../../../common/response');
const { ForbiddenError, NotFoundError } = require('../../../common/utils/error');
const { validateDevelopmentTokenRequest } = require('../validations/auth.validation');
const authService = require('../services/auth.service');

const secretsMatch = (provided, expected) => {
  if (!provided || !expected) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const createDevelopmentToken = async (req, res, next) => {
  try {
    if (env.NODE_ENV === 'production' || !env.ENABLE_DEV_AUTH) {
      throw new NotFoundError();
    }

    const isLoopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip);
    validateDevelopmentTokenRequest(req.body, { requireSecret: !isLoopback });
    if (!isLoopback && !secretsMatch(req.body.devSecret, env.DEV_AUTH_SECRET)) {
      throw new ForbiddenError('Invalid development credential');
    }

    const accessToken = authService.issueDevelopmentToken(req.body);
    res.json(response.success({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: env.JWT_EXPIRES_IN,
    }));
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = (req, res) => {
  res.json(response.success(req.user));
};

module.exports = { createDevelopmentToken, getCurrentUser };
