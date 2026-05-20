const policyService = require('../services/policy-service');
const logger = require('../../../common/utils/logger');
const response = require('../../../common/response');

/**
 * 海融惠企 Policy Controller 层
 */

// 获取政策列表
exports.getPolicyList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const policies = await policyService.getPolicyList({ page, pageSize });
    res.json(response.success(policies, '获取政策列表成功'));
  } catch (error) {
    logger.error('获取政策列表失败:', error);
    next(error);
  }
};

// 获取政策详情
exports.getPolicyDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const policy = await policyService.getPolicyDetail(id);
    if (!policy) {
      return res.status(404).json(response.error('政策不存在', 404));
    }
    res.json(response.success(policy, '获取政策详情成功'));
  } catch (error) {
    logger.error('获取政策详情失败:', error);
    next(error);
  }
};
