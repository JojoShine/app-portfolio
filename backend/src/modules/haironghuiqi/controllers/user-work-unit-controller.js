const userWorkUnitService = require('../services/user-work-unit-service');
const response = require('../../../common/utils/response');
const logger = require('../../../common/utils/logger');

/**
 * 获取用户的工作单位
 */
exports.getUserWorkUnit = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userWorkUnit = await userWorkUnitService.getUserWorkUnit(userId);

    res.json(response.success(userWorkUnit, '获取用户工作单位成功'));
  } catch (error) {
    logger.error('获取用户工作单位失败:', error);
    next(error);
  }
};

/**
 * 创建或更新用户的工作单位
 */
exports.upsertUserWorkUnit = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { workUnit } = req.body;

    if (!workUnit) {
      return res.json(response.error('工作单位不能为空', 1001));
    }

    const userWorkUnitRecord = await userWorkUnitService.upsertUserWorkUnit(userId, workUnit);

    res.json(response.success(userWorkUnitRecord, '保存用户工作单位成功'));
  } catch (error) {
    logger.error('保存用户工作单位失败:', error);
    next(error);
  }
};