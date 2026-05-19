const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const logger = require('../../common/utils/logger');
const { InternalServerError } = require('../../common/utils/error');

// JWT密钥（应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Token过期时间
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7天（秒）
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30天（秒）

/**
 * 生成JWT token
 */
const generateToken = (appId, moduleName) => {
  try {
    const payload = {
      appId,
      moduleName,
      type: 'access',
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'app-portfolio',
    });

    logger.info('Token generated', { appId, moduleName });
    return token;
  } catch (error) {
    logger.error('Failed to generate token', { error: error.message });
    throw new InternalServerError('Failed to generate token');
  }
};

/**
 * 生成刷新token
 */
const generateRefreshToken = (appId, moduleName) => {
  try {
    const payload = {
      appId,
      moduleName,
      type: 'refresh',
    };

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'app-portfolio',
    });

    logger.info('Refresh token generated', { appId, moduleName });
    return refreshToken;
  } catch (error) {
    logger.error('Failed to generate refresh token', { error: error.message });
    throw new InternalServerError('Failed to generate refresh token');
  }
};

/**
 * 获取token
 */
const getToken = async (appId, moduleName) => {
  try {
    const token = generateToken(appId, moduleName);
    const refreshToken = generateRefreshToken(appId, moduleName);

    return {
      accessToken: token,
      refreshToken,
      expiresIn: TOKEN_EXPIRY,
      tokenType: 'Bearer',
    };
  } catch (error) {
    logger.error('Failed to get token', { appId, moduleName, error: error.message });
    throw error;
  }
};

/**
 * 验证token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    return null;
  }
};

/**
 * 验证刷新token
 */
const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed', { error: error.message });
    return null;
  }
};

/**
 * 刷新token
 */
const refreshToken = async (refreshTokenStr) => {
  try {
    const decoded = verifyRefreshToken(refreshTokenStr);

    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const { appId, moduleName } = decoded;
    const newToken = generateToken(appId, moduleName);
    const newRefreshToken = generateRefreshToken(appId, moduleName);

    logger.info('Token refreshed', { appId, moduleName });

    return {
      accessToken: newToken,
      refreshToken: newRefreshToken,
      expiresIn: TOKEN_EXPIRY,
      tokenType: 'Bearer',
    };
  } catch (error) {
    logger.error('Failed to refresh token', { error: error.message });
    throw new InternalServerError('Failed to refresh token');
  }
};

module.exports = {
  getToken,
  refreshToken,
  verifyToken,
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
};