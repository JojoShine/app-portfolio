const express = require('express');
const appController = require('../controllers/app.controller');
const { requireAuth, requireRole } = require('../../../common/middleware/authorize');

const router = express.Router();

router.get('/categories', appController.getAllCategories);
router.get('/apps', appController.getAllApps);
router.get('/apps/category/:categoryId', appController.getAppsByCategory);
router.get('/apps/:appId', appController.getAppDetail);

router.use(requireAuth, requireRole('admin'));
router.post('/categories', appController.createCategory);
router.put('/categories/:categoryId', appController.updateCategory);
router.delete('/categories/:categoryId', appController.deleteCategory);
router.post('/apps', appController.createApp);
router.put('/apps/:appId', appController.updateApp);
router.delete('/apps/:appId', appController.deleteApp);

module.exports = router;
