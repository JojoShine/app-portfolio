const productService = require('../services/product-service');
const logger = require('../../../common/utils/logger');
const response = require('../../../common/response');

/**
 * 海融惠企 Product Controller 层
 */

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