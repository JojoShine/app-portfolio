const response = require('../../common/response');
const logger = require('../../common/utils/logger');
const { validateCreateUser, validateUpdateUser } = require('./validation');
const userService = require('./service');

// 创建用户
const createUser = async (req, res, next) => {
  try {
    validateCreateUser(req.body);
    const user = await userService.createUser(req.body);
    res.status(201).json(response.success(user, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

// 获取用户列表
const getUserList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const filters = {};

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const result = await userService.getUserList(page, pageSize, filters);
    res.json(response.list(result.items, result.total, result.page, result.pageSize));
  } catch (error) {
    next(error);
  }
};

// 获取用户详情
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(response.success(user));
  } catch (error) {
    next(error);
  }
};

// 更新用户
const updateUser = async (req, res, next) => {
  try {
    validateUpdateUser(req.body);
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(response.success(user, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
};

// 删除用户
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json(response.success(null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUserList,
  getUserById,
  updateUser,
  deleteUser,
};
