const express = require('express');
const userWorkUnitController = require('../controllers/user-work-unit-controller');

const router = express.Router();

/**
 * 用户工作单位相关路由
 */

// 获取用户的工作单位
router.get('/user-work-units/:userId', userWorkUnitController.getUserWorkUnit);

// 创建或更新用户的工作单位
router.post('/user-work-units/:userId', userWorkUnitController.upsertUserWorkUnit);

module.exports = router;
