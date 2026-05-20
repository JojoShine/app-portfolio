const express = require('express');
const institutionController = require('./controllers/institution-controller');
const policyController = require('./controllers/policy-controller');

const router = express.Router();

/**
 * 海融惠企 Routes - 前端查询接口
 */

// 机构相关路由
// 获取所有机构
router.get('/institutions', institutionController.getAllInstitutions);

// 按分类获取机构
router.get('/institutions/category/:category', institutionController.getInstitutionsByCategory);

// 搜索机构
router.get('/search', institutionController.searchInstitutions);

// 获取机构详情
router.get('/institutions/:id', institutionController.getInstitutionDetail);

// 政策相关路由
// 获取政策列表
router.get('/policies', policyController.getPolicyList);

// 获取政策详情
router.get('/policies/:id', policyController.getPolicyDetail);

module.exports = router;
