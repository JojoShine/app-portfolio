const database = require('../../../config/database');
const { app: logger } = require('../../../common/utils/logger');
const { NotFoundError, ConflictError } = require('../../../common/utils/error');
const USER_SELECT = Object.freeze({
  id: true,
  username: true,
  email: true,
  phone: true,
  avatar: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

const uniqueField = (error) => {
  const target = error?.meta?.target;
  if (Array.isArray(target)) return target[0];
  if (typeof target === 'string') return target;
  return 'field';
};

const createUser = async (userData) => {
  try {
    const user = await database.user.create({ data: userData, select: USER_SELECT });
    logger.info('User created', { userId: user.id, username: user.username });
    return user;
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError(`${uniqueField(error)} already exists`);
    throw error;
  }
};

const getUserList = async (page = 1, pageSize = 10, filters = {}) => {
  const offset = (page - 1) * pageSize;
  try {
    const [items, total] = await database.$transaction([
      database.user.findMany({
        where: filters,
        skip: offset,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      database.user.count({ where: filters }),
    ]);

    return { items, total, page, pageSize };
  } catch (error) {
    logger.error('Failed to get user list', { error: error.message });
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await database.user.findUnique({ where: { id: userId }, select: USER_SELECT });
    if (!user) throw new NotFoundError('User not found');
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to get user', { userId, error: error.message });
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    const exists = await database.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError('User not found');

    const user = await database.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SELECT,
    });
    logger.info('User updated', { userId, changes: Object.keys(updateData) });
    return user;
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError(`${uniqueField(error)} already exists`);
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to update user', { userId, error: error.message });
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const exists = await database.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError('User not found');

    await database.user.delete({ where: { id: userId } });
    logger.info('User deleted', { userId });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to delete user', { userId, error: error.message });
    throw error;
  }
};

module.exports = { createUser, getUserList, getUserById, updateUser, deleteUser };
