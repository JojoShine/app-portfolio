const express = require('express');
const userWorkUnitController = require('../controllers/user-work-unit-controller');

const router = express.Router();

// 获取用户的工作单位
router.get('/:userId', userWorkUnitController.getUserWorkUnit);

// 创建或更新用户的工作单位
router.post('/:userId', userWorkUnitController.upsertUserWorkUnit);

module.exports = router;