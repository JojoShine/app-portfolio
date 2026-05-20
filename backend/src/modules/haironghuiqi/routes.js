const express = require('express');
const controller = require('./controller');

const router = express.Router();

/**
 * 海融惠企 Routes - 前端查询接口
 */

// 获取所有机构
router.get('/institutions', controller.getAllInstitutions);

// 按分类获取机构
router.get('/institutions/category/:category', controller.getInstitutionsByCategory);

// 搜索机构
router.get('/search', controller.searchInstitutions);

// 获取机构详情
router.get('/institutions/:id', controller.getInstitutionDetail);

module.exports = router;