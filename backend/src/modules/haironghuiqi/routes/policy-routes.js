const express = require('express');
const policyController = require('../controllers/policy-controller');

const router = express.Router();

/**
 * 政策相关路由
 */

// 获取政策列表
router.get('/policies', policyController.getPolicyList);

// 获取政策详情
router.get('/policies/:id', policyController.getPolicyDetail);

module.exports = router;
