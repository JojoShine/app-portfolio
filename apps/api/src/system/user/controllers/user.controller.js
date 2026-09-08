const response = require('../../../common/response');
const { validateCreateUser, validateUpdateUser } = require('../validations/user.validation');
const userService = require('../services/user.service');
const { parsePagination } = require('../../../common/utils/pagination');

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(validateCreateUser(req.body));
    res.status(201).json(response.success(user, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

const getUserList = async (req, res, next) => {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const result = await userService.getUserList(page, pageSize, filters);
    res.json(response.list(result.items, result.total, result.page, result.pageSize));
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    res.json(response.success(await userService.getUserById(req.params.id)));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, validateUpdateUser(req.body));
    res.json(response.success(user, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json(response.success(null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUserList, getUserById, updateUser, deleteUser };
