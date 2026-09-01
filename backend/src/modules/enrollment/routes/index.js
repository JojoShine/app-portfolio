const express = require('express');
const controller = require('../controllers/enrollment.controller');
const { requireAuth, requireRole } = require('../../../common/middleware/authorize');

const router = express.Router();

// 公共门户与目录读取
router.get('/portal', controller.getPortal);
router.get('/windows', controller.getWindows);
router.get('/schools', controller.getSchools);
router.get('/schools/:schoolId/policy', controller.getSchoolPolicy);
router.get('/schools/:schoolId', controller.getSchool);
router.get('/contents', controller.getContents);
router.get('/faqs', controller.getFaqs);
router.get('/guides', controller.getGuides);
router.get('/districts', controller.searchDistrict);

// 二维码公示查询与实名报名完全隔离
router.get('/public/captcha', controller.getCaptcha);
router.get('/public/:type/status', controller.getPublicationStatus);
router.post('/public/:type/query', controller.publicQuery);

router.use(requireAuth);

router.get('/applications', controller.listApplications);
router.post('/applications', controller.createApplication);
router.get('/applications/:applicationId', controller.getApplication);
router.patch('/applications/:applicationId/draft', controller.updateDraft);
router.patch('/applications/:applicationId/school', controller.changeSchool);
router.post('/applications/:applicationId/policy-confirmation', controller.confirmPolicy);
router.post('/applications/:applicationId/verifications', controller.runVerifications);
router.patch('/applications/:applicationId/verifications/:verificationId', controller.updateVerification);
router.post('/applications/:applicationId/materials', controller.addMaterial);
router.patch('/applications/:applicationId/materials/order', controller.reorderMaterials);
router.delete('/applications/:applicationId/materials/:materialId', controller.removeMaterial);
router.post('/applications/:applicationId/submit', controller.submitApplication);

router.post(
  '/review/applications/:applicationId',
  requireRole('reviewer', 'admin'),
  controller.reviewApplication
);
router.get(
  '/review/applications',
  requireRole('reviewer', 'admin'),
  controller.listReviewApplications
);
router.get(
  '/review/applications/:applicationId',
  requireRole('reviewer', 'admin'),
  controller.getReviewApplication
);
router.get(
  '/review/applications/:applicationId/materials/:materialId/file',
  requireRole('reviewer', 'admin'),
  controller.getReviewMaterialFile
);
router.post(
  '/admin/applications/:applicationId/admit',
  requireRole('admin'),
  controller.admitApplication
);
router.put('/admin/publications/:type', requireRole('admin'), controller.setPublication);

module.exports = router;
