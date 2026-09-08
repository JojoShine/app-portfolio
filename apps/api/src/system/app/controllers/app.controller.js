const appService = require('../services/app.service');
const categoryService = require('../services/category.service');
const { app: logger } = require('../../../common/utils/logger');
const response = require('../../../common/response');
const { NotFoundError } = require('../../../common/utils/error');
const { validateApp, validateCategory } = require('../validations/app.validation');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(response.success(categories, '获取分类列表成功'));
  } catch (error) {
    logger.error('获取分类列表失败:', error);
    next(error);
  }
};

const getAllApps = async (req, res, next) => {
  try {
    const apps = await appService.getAllApps();
    res.json(response.success(apps, '获取应用列表成功'));
  } catch (error) {
    logger.error('获取应用列表失败:', error);
    next(error);
  }
};

const getAppsByCategory = async (req, res, next) => {
  try {
    const apps = await appService.getAppsByCategory(req.params.categoryId);
    res.json(response.success(apps, '获取应用列表成功'));
  } catch (error) {
    logger.error('获取应用列表失败:', error);
    next(error);
  }
};

const getAppDetail = async (req, res, next) => {
  try {
    const app = await appService.getAppDetail(req.params.appId);
    if (!app) throw new NotFoundError('应用不存在');
    res.json(response.success(app, '获取应用详情成功'));
  } catch (error) {
    logger.error('获取应用详情失败:', error);
    next(error);
  }
};

const createApp = async (req, res, next) => {
  try {
    const app = await appService.createApp(validateApp(req.body));
    res.status(201).json(response.success(app, '创建应用成功'));
  } catch (error) {
    logger.error('创建应用失败:', error);
    next(error);
  }
};

const updateApp = async (req, res, next) => {
  try {
    const app = await appService.updateApp(req.params.appId, validateApp(req.body, true));
    res.json(response.success(app, '更新应用成功'));
  } catch (error) {
    logger.error('更新应用失败:', error);
    next(error);
  }
};

const deleteApp = async (req, res, next) => {
  try {
    await appService.deleteApp(req.params.appId);
    res.json(response.success(null, '删除应用成功'));
  } catch (error) {
    logger.error('删除应用失败:', error);
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(validateCategory(req.body));
    res.status(201).json(response.success(category, '创建分类成功'));
  } catch (error) {
    logger.error('创建分类失败:', error);
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.categoryId,
      validateCategory(req.body, true)
    );
    res.json(response.success(category, '更新分类成功'));
  } catch (error) {
    logger.error('更新分类失败:', error);
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId);
    res.json(response.success(null, '删除分类成功'));
  } catch (error) {
    logger.error('删除分类失败:', error);
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getAllApps,
  getAppsByCategory,
  getAppDetail,
  createApp,
  updateApp,
  deleteApp,
  createCategory,
  updateCategory,
  deleteCategory,
};
