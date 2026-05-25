const express = require('express');
const institutionRoutes = require('./institution-routes');
const policyRoutes = require('./policy-routes');
const productRoutes = require('./product-routes');
const applicationRoutes = require('./application-routes');
const userWorkUnitRoutes = require('./user-work-unit-routes');

const router = express.Router();

/**
 * 海融惠企 Routes - 前端查询接口
 * 汇聚所有路由
 */

router.use(institutionRoutes);
router.use(policyRoutes);
router.use(productRoutes);
router.use(applicationRoutes);
router.use(userWorkUnitRoutes);

module.exports = router;
