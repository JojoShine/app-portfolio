const Application = require('../models/application-model');
const Institution = require('../models/institution-model');
const Product = require('../models/product-model');
const { haironghuiqi: logger } = require('../../../common/utils/logger');
const { NotFoundError, InternalServerError } = require('../../../common/utils/error');

/**
 * 创建申请
 */
const createApplication = async (applicationData) => {
  try {
    // 检查是否存在重复申请（同一用户、同一机构、同一产品、同一天内）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { Op } = require('sequelize');
    const existingApplication = await Application.findOne({
      where: {
        userId: applicationData.userId,
        institutionId: applicationData.institutionId,
        productId: applicationData.productId,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    if (existingApplication) {
      throw new Error('您今天已经申请过该产品，请勿重复申请');
    }

    const application = await Application.create(applicationData);
    logger.info('Application created successfully', { applicationId: application.id });
    return application;
  } catch (error) {
    logger.error('Failed to create application', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * 获取用户的申请列表
 */
const getUserApplications = async (userId, params = {}) => {
  try {
    const { page = 1, pageSize = 10, status = null } = params;
    const offset = (page - 1) * pageSize;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Institution,
          as: 'Institution',
          attributes: ['id', 'name', 'address', 'businessHours'],
        },
        {
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'description', 'maxLoanAmount', 'maxLoanTerm', 'minAnnualRate', 'isFeatured'],
        },
      ],
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    logger.info('User applications retrieved', {
      userId,
      total: count,
      page,
      pageSize,
    });

    return { count, rows };
  } catch (error) {
    logger.error('Failed to get user applications', {
      userId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve applications');
  }
};

/**
 * 获取申请详情
 */
const getApplicationDetail = async (applicationId) => {
  try {
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Institution,
          as: 'Institution',
          attributes: ['id', 'name', 'address', 'businessHours', 'phone'],
        },
        {
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'description', 'maxLoanAmount', 'maxLoanTerm', 'minAnnualRate', 'isFeatured'],
        },
      ],
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    logger.info('Application detail retrieved', { applicationId });
    return application;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to get application detail', {
      applicationId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve application');
  }
};

/**
 * 更新申请状态
 */
const updateApplicationStatus = async (applicationId, status) => {
  try {
    const application = await Application.findByPk(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    application.status = status;
    await application.save();

    logger.info('Application status updated', { applicationId, status });
    return application;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to update application status', {
      applicationId,
      error: error.message,
    });
    throw new InternalServerError('Failed to update application');
  }
};

/**
 * 删除申请
 */
const deleteApplication = async (applicationId) => {
  try {
    const application = await Application.findByPk(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    await application.destroy();

    logger.info('Application deleted successfully', { applicationId });
    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to delete application', {
      applicationId,
      error: error.message,
    });
    throw new InternalServerError('Failed to delete application');
  }
};

/**
 * 批量提交申请
 */
const submitApplications = async (applicationIds) => {
  try {
    const applications = await Application.update(
      { status: 'submitted' },
      {
        where: {
          id: applicationIds,
        },
      }
    );

    logger.info('Applications submitted', { count: applicationIds.length });
    return { success: true, count: applications[0] };
  } catch (error) {
    logger.error('Failed to submit applications', {
      error: error.message,
    });
    throw new InternalServerError('Failed to submit applications');
  }
};

module.exports = {
  createApplication,
  getUserApplications,
  getApplicationDetail,
  updateApplicationStatus,
  deleteApplication,
  submitApplications,
};
