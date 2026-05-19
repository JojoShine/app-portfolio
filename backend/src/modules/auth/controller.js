const response = require('../../common/response');
const logger = require('../../common/utils/logger');
const { validateGetToken, validateRefreshToken } = require('./validation');
const authService = require('./service');

/**
 * 获取token
 */
const getToken = async (req, res, next) => {
  try {
    const { appId, moduleName } = req.body;
    validateGetToken({ appId, moduleName });

    const tokenData = await authService.getToken(appId, moduleName);
    res.json(response.success(tokenData, 'Token generated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * 刷新token
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    validateRefreshToken({ refreshToken });

    const tokenData = await authService.refreshToken(refreshToken);
    res.json(response.success(tokenData, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getToken,
  refreshTokenHandler,
};
