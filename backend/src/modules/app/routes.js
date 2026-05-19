const express = require('express');
const router = express.Router();
const appController = require('./controller');

/**
 * 应用管理路由
 */

// 分类相关
router.get('/categories', appController.getAllCategories);
router.post('/categories', appController.createCategory);
router.put('/categories/:categoryId', appController.updateCategory);
router.delete('/categories/:categoryId', appController.deleteCategory);

// 应用相关
router.get('/apps', appController.getAllApps);
router.get('/apps/category/:categoryId', appController.getAppsByCategory);
router.get('/apps/:appId', appController.getAppDetail);
router.post('/apps', appController.createApp);
router.put('/apps/:appId', appController.updateApp);
router.delete('/apps/:appId', appController.deleteApp);

module.exports = router;
