const service = require('../services/institution-service');
const { haironghuiqi: logger } = require('../../../common/utils/logger');
const response = require('../../../common/response');

/**
 * 海融惠企 Controller 层 - 前端查询接口
 */

// 获取所有机构
exports.getAllInstitutions = async (req, res, next) => {
  try {
    const institutions = await service.getAllInstitutions();
    res.json(response.success(institutions, '获取机构列表成功'));
  } catch (error) {
    logger.error('获取机构列表失败:', error);
    next(error);
  }
};

// 按分类获取机构
exports.getInstitutionsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const institutions = await service.getInstitutionsByCategory(category);
    res.json(response.success(institutions, '获取机构列表成功'));
  } catch (error) {
    logger.error('按分类获取机构失败:', error);
    next(error);
  }
};

// 搜索机构
exports.searchInstitutions = async (req, res, next) => {
  try {
    const { query, category } = req.query;
    if (!query) {
      return res.status(400).json(response.error('搜索关键词不能为空', 400));
    }
    const institutions = await service.searchInstitutions(query, category);
    res.json(response.success(institutions, '搜索成功'));
  } catch (error) {
    logger.error('搜索机构失败:', error);
    next(error);
  }
};

// 获取机构详情
exports.getInstitutionDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institution = await service.getInstitutionDetail(id);
    if (!institution) {
      return res.status(404).json(response.error('机构不存在', 404));
    }
    res.json(response.success(institution, '获取机构详情成功'));
  } catch (error) {
    logger.error('获取机构详情失败:', error);
    next(error);
  }
};