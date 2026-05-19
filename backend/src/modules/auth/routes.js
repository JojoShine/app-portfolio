const express = require('express');
const router = express.Router();
const authController = require('./controller');

/**
 * 获取token
 * POST /api/auth/token
 * Body: { appId, moduleName }
 */
router.post('/token', authController.getToken);

/**
 * 刷新token
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
router.post('/refresh', authController.refreshTokenHandler);

module.exports = router;