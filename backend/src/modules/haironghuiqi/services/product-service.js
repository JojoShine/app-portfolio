const Product = require('../models/product-model');
const Institution = require('../models/institution-model');
const logger = require('../../../common/utils/logger');
const { NotFoundError, InternalServerError } = require('../../../common/utils/error');

/**
 * 获取指定分类下所有机构的产品列表
 */
const getProductsByCategory = async (category, params = {}) => {
  try {
    const { page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    // 获取该分类下的所有机构ID
    const institutions = await Institution.findAll({
      where: { category, status: 'active' },
      attributes: ['id'],
    });

    const institutionIds = institutions.map((inst) => inst.id);

    if (institutionIds.length === 0) {
      return [];
    }

    // 获取这些机构下的所有产品
    const { count, rows } = await Product.findAndCountAll({
      where: {
        institutionId: institutionIds,
        status: 'active',
      },
      offset,
      limit: pageSize,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    logger.info('Products retrieved by category', {
      category,
      total: count,
      page,
      pageSize,
    });

    return rows;
  } catch (error) {
    logger.error('Failed to get products by category', {
      category,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve products');
  }
};

/**
 * 获取所有产品列表
 */
const getAllProducts = async (params = {}) => {
  try {
    const { page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Product.findAndCountAll({
      where: { status: 'active' },
      offset,
      limit: pageSize,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    logger.info('All products retrieved', {
      total: count,
      page,
      pageSize,
    });

    return rows;
  } catch (error) {
    logger.error('Failed to get all products', {
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve products');
  }
};

/**
 * 获取机构的产品列表
 */
const getProductsByInstitution = async (institutionId, params = {}) => {
  try {
    const { page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Product.findAndCountAll({
      where: { institutionId, status: 'active' },
      offset,
      limit: pageSize,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    logger.info('Products retrieved for institution', {
      institutionId,
      total: count,
      page,
      pageSize,
    });

    return rows;
  } catch (error) {
    logger.error('Failed to get products for institution', {
      institutionId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve products');
  }
};

/**
 * 获取产品详情
 */
const getProductDetail = async (productId) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    logger.info('Product detail retrieved', { productId });
    return product;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to get product detail', {
      productId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve product detail');
  }
};

/**
 * 创建产品
 */
const createProduct = async (productData) => {
  try {
    const product = await Product.create(productData);

    logger.info('Product created successfully', {
      productId: product.id,
      name: product.name,
    });

    return product;
  } catch (error) {
    logger.error('Failed to create product', { error: error.message });
    throw new InternalServerError('Failed to create product');
  }
};

/**
 * 更新产品
 */
const updateProduct = async (productId, productData) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await product.update(productData);

    logger.info('Product updated successfully', { productId });
    return product;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to update product', {
      productId,
      error: error.message,
    });
    throw new InternalServerError('Failed to update product');
  }
};

/**
 * 根据关键词搜索产品
 */
const searchProductsByKeywords = async (userInput, params = {}) => {
  try {
    const { limit = 3 } = params;

    if (!userInput || userInput.trim() === '') {
      return [];
    }

    // 获取所有活跃产品
    const allProducts = await Product.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    if (allProducts.length === 0) {
      return [];
    }

    // 将用户输入转为小写，便于匹配
    const input = userInput.toLowerCase();

    // 为每个产品计算匹配分数
    const scoredProducts = allProducts.map((product) => {
      let score = 0;
      const keywords = product.keywords || [];

      // 遍历产品的关键词数组
      keywords.forEach((keyword) => {
        if (input.includes(keyword.toLowerCase())) {
          score += 10; // 每个匹配的关键词加10分
        }
      });

      // 也在产品名称中搜索
      if (product.name && input.includes(product.name.toLowerCase())) {
        score += 20; // 名称匹配加分更高
      }

      // 在产品描述中搜索
      if (product.description && input.includes(product.description.toLowerCase())) {
        score += 5;
      }

      return { ...product.toJSON(), score };
    });

    // 过滤出有分数的产品，按分数降序排序，返回前limit个
    const matchedProducts = scoredProducts
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    logger.info('Products searched by keywords', {
      userInput,
      matchedCount: matchedProducts.length,
    });

    return matchedProducts;
  } catch (error) {
    logger.error('Failed to search products by keywords', {
      error: error.message,
    });
    throw new InternalServerError('Failed to search products');
  }
};

/**
 * 删除产品
 */
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await product.destroy();

    logger.info('Product deleted successfully', { productId });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to delete product', {
      productId,
      error: error.message,
    });
    throw new InternalServerError('Failed to delete product');
  }
};

module.exports = {
  getProductsByCategory,
  getAllProducts,
  getProductsByInstitution,
  getProductDetail,
  searchProductsByKeywords,
  createProduct,
  updateProduct,
  deleteProduct,
};