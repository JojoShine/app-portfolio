const productService = require('../services/product-service');
const logger = require('../../../common/utils/logger');
const response = require('../../../common/response');

/**
 * 海融惠企 Product Controller 层
 */

// 获取所有产品列表
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const products = await productService.getAllProducts({ page, pageSize });
    res.json(response.success(products, '获取产品列表成功'));
  } catch (error) {
    logger.error('获取产品列表失败:', error);
    next(error);
  }
};

// 获取指定分类下的产品列表
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const products = await productService.getProductsByCategory(category, { page, pageSize });
    res.json(response.success(products, '获取产品列表成功'));
  } catch (error) {
    logger.error('获取产品列表失败:', error);
    next(error);
  }
};

// 获取机构的产品列表
exports.getProductsByInstitution = async (req, res, next) => {
  try {
    const { institutionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const products = await productService.getProductsByInstitution(institutionId, { page, pageSize });
    res.json(response.success(products, '获取产品列表成功'));
  } catch (error) {
    logger.error('获取产品列表失败:', error);
    next(error);
  }
};

// 获取产品详情
exports.getProductDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductDetail(id);
    if (!product) {
      return res.status(404).json(response.error('产品不存在', 404));
    }
    res.json(response.success(product, '获取产品详情成功'));
  } catch (error) {
    logger.error('获取产品详情失败:', error);
    next(error);
  }
};

// 根据关键词搜索产品
exports.searchProductsByKeywords = async (req, res, next) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 3;

    if (!query || query.trim() === '') {
      return res.json(response.success([], '请输入搜索内容'));
    }

    const products = await productService.searchProductsByKeywords(query, { limit });
    
    if (products.length === 0) {
      return res.json(response.success([], '未找到相关产品，建议您切换到选择模式探索更多产品'));
    }

    res.json(response.success(products, '找到相关产品'));
  } catch (error) {
    logger.error('关键词搜索产品失败:', error);
    next(error);
  }
};