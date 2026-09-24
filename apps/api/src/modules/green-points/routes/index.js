const router = require('express').Router();
const controller = require('../controllers/green-points.controller');
const { requireAuth } = require('../../../common/middleware/authorize');

router.get('/assets/:id', controller.asset);
router.use(requireAuth);
router.get('/read', controller.read);
router.post('/check-in', controller.checkIn);
router.post('/favorite', controller.favorite);
router.post('/view', controller.view);
router.post('/claim-coupon', controller.claimCoupon);
router.post('/save-address', controller.saveAddress);
router.post('/delete-address', controller.deleteAddress);
router.post('/support', controller.support);
router.post('/redeem', controller.redeem);
router.post('/cancel', controller.cancel);
router.post('/complete', controller.complete);
module.exports = router;
