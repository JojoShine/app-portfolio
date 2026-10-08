const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../../../common/middleware/authorize');

const router = express.Router();

// 仅供本地联调，生产环境始终关闭。
router.post('/development-token', authController.createDevelopmentToken);
// 公共演示仅允许服务端固定身份；不读取请求中的用户或角色。
router.post('/demo-token', authController.createPublicDemoToken);
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
