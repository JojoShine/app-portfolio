const { UnauthorizedError, ForbiddenError } = require('../utils/error');
const authService = require('../../system/auth/services/auth.service');

const requireAuth = (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Bearer access token is required');
    }

    req.user = authService.verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  const roles = req.user?.roles || [];
  if (!allowedRoles.some((role) => roles.includes(role))) {
    return next(new ForbiddenError('Insufficient permissions'));
  }
  next();
};

module.exports = { requireAuth, requireRole };
