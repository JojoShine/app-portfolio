const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../../../common/middleware/authorize');

const router = express.Router();

// 仅供本地联调，生产环境始终关闭。
router.post('/development-token', authController.createDevelopmentToken);
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
