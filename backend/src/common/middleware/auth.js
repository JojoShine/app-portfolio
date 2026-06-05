const { app: logger } = require('../utils/logger');
const { UnauthorizedError } = require('../utils/error');
const authService = require('../../modules/auth/service');

/**
 * Token验证中间件
 * 从Authorization header中提取token并验证
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Missing authorization header');
    }

    // 提取Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // 将解码的token信息附加到request对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Token verification failed'));
    }
  }
};

module.exports = authMiddleware;