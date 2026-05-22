const applicationService = require('../services/application-service');
const logger = require('../../../common/utils/logger');
const response = require('../../../common/response');

/**
 * 海融惠企 Application Controller 层
 */

// 创建申请
exports.createApplication = async (req, res, next) => {
  try {
    const { userId, institutionId, productId, userName, userPhone, userIdCard, userWorkUnit, applicationType, requirementDescription } = req.body;

    const application = await applicationService.createApplication({
      userId,
      institutionId,
      productId,
      userName,
      userPhone,
      userIdCard,
      userWorkUnit,
      applicationType,
      requirementDescription,
    });

    res.json(response.success(application, '申请创建成功'));
  } catch (error) {
    // 检查是否是重复申请错误
    if (error.message === '您今天已经申请过该产品，请勿重复申请') {
      res.json(response.error(error.message, 1006));
    } else {
      logger.error('创建申请失败:', error);
      next(error);
    }
  }
};

// 获取用户的申请列表
exports.getUserApplications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const status = req.query.status || null;

    const result = await applicationService.getUserApplications(userId, { page, pageSize, status });
    res.json(response.list(result.rows, result.count, page, pageSize));
  } catch (error) {
    logger.error('获取申请列表失败:', error);
    next(error);
  }
};

// 获取申请详情
exports.getApplicationDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await applicationService.getApplicationDetail(id);
    res.json(response.success(application, '获取申请详情成功'));
  } catch (error) {
    logger.error('获取申请详情失败:', error);
    next(error);
  }
};

// 更新申请状态
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await applicationService.updateApplicationStatus(id, status);
    res.json(response.success(application, '申请状态更新成功'));
  } catch (error) {
    logger.error('更新申请状态失败:', error);
    next(error);
  }
};

// 删除申请
exports.deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await applicationService.deleteApplication(id);
    res.json(response.success(result, '申请删除成功'));
  } catch (error) {
    logger.error('删除申请失败:', error);
    next(error);
  }
};

// 批量提交申请
exports.submitApplications = async (req, res, next) => {
  try {
    const { applicationIds } = req.body;
    const result = await applicationService.submitApplications(applicationIds);
    res.json(response.success(result, '申请提交成功'));
  } catch (error) {
    logger.error('提交申请失败:', error);
    next(error);
  }
};
