const express = require('express');
const applicationController = require('../controllers/application-controller');

const router = express.Router();

/**
 * 申请相关路由
 */

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
