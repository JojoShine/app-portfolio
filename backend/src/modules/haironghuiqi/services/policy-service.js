const Policy = require('../models/policy-model');
const { haironghuiqi: logger } = require('../../../common/utils/logger');
const { NotFoundError, InternalServerError } = require('../../../common/utils/error');

/**
 * 获取所有政策
 */
const getPolicyList = async (params = {}) => {
  try {
    const { page = 1, pageSize = 10, sort = 'sort' } = params;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Policy.findAndCountAll({
      offset,
      limit: pageSize,
      order: [[sort, 'ASC'], ['publishedAt', 'DESC']],
    });

    logger.info('Policy list retrieved', {
      total: count,
      page,
      pageSize,
    });

    return rows;
  } catch (error) {
    logger.error('Failed to get policy list', { error: error.message });
    throw new InternalServerError('Failed to retrieve policy list');
  }
};

/**
 * 获取政策详情
 */
const getPolicyDetail = async (policyId) => {
  try {
    const policy = await Policy.findByPk(policyId);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    logger.info('Policy detail retrieved', { policyId });
    return policy;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to get policy detail', {
      policyId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve policy detail');
  }
};

/**
 * 创建政策
 */
const createPolicy = async (policyData) => {
  try {
    const policy = await Policy.create(policyData);

    logger.info('Policy created successfully', {
      policyId: policy.id,
      title: policy.title,
    });

    return policy;
  } catch (error) {
    logger.error('Failed to create policy', { error: error.message });
    throw new InternalServerError('Failed to create policy');
  }
};

/**
 * 更新政策
 */
const updatePolicy = async (policyId, policyData) => {
  try {
    const policy = await Policy.findByPk(policyId);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    await policy.update(policyData);

    logger.info('Policy updated successfully', { policyId });
    return policy;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to update policy', {
      policyId,
      error: error.message,
    });
    throw new InternalServerError('Failed to update policy');
  }
};

/**
 * 删除政策
 */
const deletePolicy = async (policyId) => {
  try {
    const policy = await Policy.findByPk(policyId);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    await policy.destroy();

    logger.info('Policy deleted successfully', { policyId });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to delete policy', {
      policyId,
      error: error.message,
    });
    throw new InternalServerError('Failed to delete policy');
  }
};

module.exports = {
  getPolicyList,
  getPolicyDetail,
  createPolicy,
  updatePolicy,
  deletePolicy,
};
