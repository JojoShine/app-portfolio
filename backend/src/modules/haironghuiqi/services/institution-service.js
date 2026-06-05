const Institution = require('../models/institution-model');
const Product = require('../models/product-model');
const { haironghuiqi: logger } = require('../../../common/utils/logger');

/**
 * 海融惠企 Service 层 - 前端查询接口
 */

// 获取所有机构
exports.getAllInstitutions = async () => {
  try {
    const institutions = await Institution.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });
    return institutions;
  } catch (error) {
    logger.error('获取机构列表失败:', error);
    throw error;
  }
};

// 按分类获取机构
exports.getInstitutionsByCategory = async (category) => {
  try {
    const institutions = await Institution.findAll({
      where: { status: 'active', category },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });
    return institutions;
  } catch (error) {
    logger.error('按分类获取机构失败:', error);
    throw error;
  }
};

// 搜索机构
exports.searchInstitutions = async (query, category = null) => {
  try {
    const where = {
      status: 'active',
      [require('sequelize').Op.or]: [
        { name: { [require('sequelize').Op.like]: `%${query}%` } },
        { description: { [require('sequelize').Op.like]: `%${query}%` } },
      ],
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    const institutions = await Institution.findAll({
      where,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });
    return institutions;
  } catch (error) {
    logger.error('搜索机构失败:', error);
    throw error;
  }
};

// 获取机构详情
exports.getInstitutionDetail = async (id) => {
  try {
    const institution = await Institution.findByPk(id);
    if (!institution) {
      return null;
    }

    // 获取该机构的产品列表
    const products = await Product.findAll({
      where: { institutionId: id, status: 'active' },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    // 将产品列表添加到机构对象中
    institution.dataValues.products = products;

    return institution;
  } catch (error) {
    logger.error('获取机构详情失败:', error);
    throw error;
  }
};
