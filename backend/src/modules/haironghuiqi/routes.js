const express = require('express');
const institutionController = require('./controllers/institution-controller');
const policyController = require('./controllers/policy-controller');
const productController = require('./controllers/product-controller');
const applicationController = require('./controllers/application-controller');

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

// 产品相关路由
// 获取所有产品列表
router.get('/products', productController.getAllProducts);

// 获取指定分类下的产品列表
router.get('/products/category/:category', productController.getProductsByCategory);

// 获取机构的产品列表
router.get('/institutions/:institutionId/products', productController.getProductsByInstitution);

// 获取产品详情
router.get('/products/:id', productController.getProductDetail);

// 申请相关路由
// 创建申请
router.post('/applications', applicationController.createApplication);

// 获取用户的申请列表
router.get('/users/:userId/applications', applicationController.getUserApplications);

// 获取申请详情
router.get('/applications/:id', applicationController.getApplicationDetail);

// 更新申请状态
router.put('/applications/:id/status', applicationController.updateApplicationStatus);

// 删除申请
router.delete('/applications/:id', applicationController.deleteApplication);

// 批量提交申请
router.post('/applications/batch/submit', applicationController.submitApplications);

module.exports = router;
