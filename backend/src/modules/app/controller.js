const appService = require('./service');
const { app: logger } = require('../../common/utils/logger');
const response = require('../../common/response');

/**
 * 应用管理 Controller 层
 */

// 获取所有分类
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await appService.getAllCategories();
    res.json(response.success(categories, '获取分类列表成功'));
  } catch (error) {
    logger.error('获取分类列表失败:', error);
    next(error);
  }
};

// 获取所有应用
exports.getAllApps = async (req, res, next) => {
  try {
    const apps = await appService.getAllApps();
    res.json(response.success(apps, '获取应用列表成功'));
  } catch (error) {
    logger.error('获取应用列表失败:', error);
    next(error);
  }
};

// 按分类获取应用
exports.getAppsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const apps = await appService.getAppsByCategory(categoryId);
    res.json(response.success(apps, '获取应用列表成功'));
  } catch (error) {
    logger.error('获取应用列表失败:', error);
    next(error);
  }
};

// 获取应用详情
exports.getAppDetail = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const app = await appService.getAppDetail(appId);
    if (!app) {
      return res.status(404).json(response.error('应用不存在', 404));
    }
    res.json(response.success(app, '获取应用详情成功'));
  } catch (error) {
    logger.error('获取应用详情失败:', error);
    next(error);
  }
};

// 创建应用
exports.createApp = async (req, res, next) => {
  try {
    const appData = req.body;
    const app = await appService.createApp(appData);
    res.status(201).json(response.success(app, '创建应用成功'));
  } catch (error) {
    logger.error('创建应用失败:', error);
    next(error);
  }
};

// 更新应用
exports.updateApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const appData = req.body;
    const app = await appService.updateApp(appId, appData);
    res.json(response.success(app, '更新应用成功'));
  } catch (error) {
    logger.error('更新应用失败:', error);
    next(error);
  }
};

// 删除应用
exports.deleteApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    await appService.deleteApp(appId);
    res.json(response.success(null, '删除应用成功'));
  } catch (error) {
    logger.error('删除应用失败:', error);
    next(error);
  }
};

// 创建分类
exports.createCategory = async (req, res, next) => {
  try {
    const categoryData = req.body;
    const category = await appService.createCategory(categoryData);
    res.status(201).json(response.success(category, '创建分类成功'));
  } catch (error) {
    logger.error('创建分类失败:', error);
    next(error);
  }
};

// 更新分类
exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const categoryData = req.body;
    const category = await appService.updateCategory(categoryId, categoryData);
    res.json(response.success(category, '更新分类成功'));
  } catch (error) {
    logger.error('更新分类失败:', error);
    next(error);
  }
};

// 删除分类
exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    await appService.deleteCategory(categoryId);
    res.json(response.success(null, '删除分类成功'));
  } catch (error) {
    logger.error('删除分类失败:', error);
    next(error);
  }
};