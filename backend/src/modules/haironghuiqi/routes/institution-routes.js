const express = require('express');
const institutionController = require('../controllers/institution-controller');

const router = express.Router();

/**
 * 机构相关路由
 */

// 获取所有机构
router.get('/institutions', institutionController.getAllInstitutions);

// 按分类获取机构
router.get('/institutions/category/:category', institutionController.getInstitutionsByCategory);

// 搜索机构
router.get('/search', institutionController.searchInstitutions);

// 获取机构详情
router.get('/institutions/:id', institutionController.getInstitutionDetail);

module.exports = router;