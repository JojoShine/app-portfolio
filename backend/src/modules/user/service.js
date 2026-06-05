const User = require('./model');
const { app: logger } = require('../../common/utils/logger');
const { NotFoundError, ConflictError } = require('../../common/utils/error');

// 创建用户
const createUser = async (userData) => {
  try {
    const user = await User.create(userData);
    logger.info('User created', { userId: user.id, username: user.username });
    return user;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      throw new ConflictError(`${field} already exists`);
    }
    throw error;
  }
};

// 获取用户列表
const getUserList = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await User.findAndCountAll({
      where: filters,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    logger.error('Failed to get user list', { error: error.message });
    throw error;
  }
};

// 获取用户详情
const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to get user', { userId, error: error.message });
    throw error;
  }
};

// 更新用户
const updateUser = async (userId, updateData) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update(updateData);
    logger.info('User updated', { userId, changes: Object.keys(updateData) });
    return user;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      throw new ConflictError(`${field} already exists`);
    }
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to update user', { userId, error: error.message });
    throw error;
  }
};

// 删除用户
const deleteUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.destroy();
    logger.info('User deleted', { userId });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to delete user', { userId, error: error.message });
    throw error;
  }
};

module.exports = {
  createUser,
  getUserList,
  getUserById,
  updateUser,
  deleteUser,
};
