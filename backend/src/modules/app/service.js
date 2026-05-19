const App = require('./model');
const Category = require('./category');

/**
 * 应用管理 Service 层
 */

// 获取所有分类
exports.getAllCategories = async () => {
  try {
    const categories = await Category.findAll({
      order: [['sort', 'ASC']],
    });
    return categories;
  } catch (error) {
    throw error;
  }
};

// 获取所有应用
exports.getAllApps = async () => {
  try {
    const apps = await App.findAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'name'],
        },
      ],
      order: [['sort', 'ASC']],
    });
    return apps;
  } catch (error) {
    throw error;
  }
};

// 按分类获取应用
exports.getAppsByCategory = async (categoryId) => {
  try {
    const apps = await App.findAll({
      where: { categoryId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name'],
        },
      ],
      order: [['sort', 'ASC']],
    });
    return apps;
  } catch (error) {
    throw error;
  }
};

// 获取应用详情
exports.getAppDetail = async (appId) => {
  try {
    const app = await App.findByPk(appId, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name'],
        },
      ],
    });
    return app;
  } catch (error) {
    throw error;
  }
};

// 创建应用
exports.createApp = async (appData) => {
  try {
    const app = await App.create(appData);
    return app;
  } catch (error) {
    throw error;
  }
};

// 更新应用
exports.updateApp = async (appId, appData) => {
  try {
    const app = await App.findByPk(appId);
    if (!app) {
      throw new Error('应用不存在');
    }
    await app.update(appData);
    return app;
  } catch (error) {
    throw error;
  }
};

// 删除应用
exports.deleteApp = async (appId) => {
  try {
    const app = await App.findByPk(appId);
    if (!app) {
      throw new Error('应用不存在');
    }
    await app.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};

// 创建分类
exports.createCategory = async (categoryData) => {
  try {
    const category = await Category.create(categoryData);
    return category;
  } catch (error) {
    throw error;
  }
};

// 更新分类
exports.updateCategory = async (categoryId, categoryData) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new Error('分类不存在');
    }
    await category.update(categoryData);
    return category;
  } catch (error) {
    throw error;
  }
};

// 删除分类
exports.deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new Error('分类不存在');
    }
    await category.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};