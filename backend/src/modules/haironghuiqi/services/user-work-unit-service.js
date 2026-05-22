const UserWorkUnit = require('../models/user-work-unit-model');
const logger = require('../../../common/utils/logger');
const { NotFoundError, InternalServerError } = require('../../../common/utils/error');

/**
 * 获取用户的工作单位
 */
const getUserWorkUnit = async (userId) => {
  try {
    const userWorkUnit = await UserWorkUnit.findOne({
      where: { userId },
    });

    if (!userWorkUnit) {
      return null;
    }

    logger.info('User work unit retrieved', { userId });
    return userWorkUnit;
  } catch (error) {
    logger.error('Failed to get user work unit', {
      userId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve user work unit');
  }
};

/**
 * 创建或更新用户的工作单位
 */
const upsertUserWorkUnit = async (userId, workUnit) => {
  try {
    const [userWorkUnitRecord, created] = await UserWorkUnit.findOrCreate({
      where: { userId },
      defaults: { workUnit },
    });

    if (!created) {
      // 如果已存在，更新工作单位
      await userWorkUnitRecord.update({ workUnit });
    }

    logger.info('User work unit upserted', { userId, workUnit, created });
    return userWorkUnitRecord;
  } catch (error) {
    logger.error('Failed to upsert user work unit', {
      userId,
      workUnit,
      error: error.message,
    });
    throw new InternalServerError('Failed to upsert user work unit');
  }
};

module.exports = {
  getUserWorkUnit,
  upsertUserWorkUnit,
};