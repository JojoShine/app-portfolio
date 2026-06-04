const express = require('express');
const productController = require('../controllers/product-controller');

const router = express.Router();

/**
 * 产品相关路由
 */

// 获取所有产品列表
router.get('/products', productController.getAllProducts);

// 根据关键词搜索产品（必须在 /products/:id 之前，避免 "search" 被当作 id）
router.get('/products/search', productController.searchProductsByKeywords);

// 获取指定分类下的产品列表
router.get('/products/category/:category', productController.getProductsByCategory);

// 获取机构的产品列表
router.get('/institutions/:institutionId/products', productController.getProductsByInstitution);

// 获取产品详情
router.get('/products/:id', productController.getProductDetail);

module.exports = router;
