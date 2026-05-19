import api from './api';

/**
 * 应用管理 API 服务
 */

const appAPI = {
  // 获取所有分类
  getAllCategories: () => {
    return api.get('/app/categories');
  },

  // 获取所有应用
  getAllApps: () => {
    return api.get('/app/apps');
  },

  // 按分类获取应用
  getAppsByCategory: (categoryId) => {
    return api.get(`/app/apps/category/${categoryId}`);
  },

  // 获取应用详情
  getAppDetail: (appId) => {
    return api.get(`/app/apps/${appId}`);
  },

  // 创建应用
  createApp: (appData) => {
    return api.post('/app/apps', appData);
  },

  // 更新应用
  updateApp: (appId, appData) => {
    return api.put(`/app/apps/${appId}`, appData);
  },

  // 删除应用
  deleteApp: (appId) => {
    return api.delete(`/app/apps/${appId}`);
  },

  // 创建分类
  createCategory: (categoryData) => {
    return api.post('/app/categories', categoryData);
  },

  // 更新分类
  updateCategory: (categoryId, categoryData) => {
    return api.put(`/app/categories/${categoryId}`, categoryData);
  },

  // 删除分类
  deleteCategory: (categoryId) => {
    return api.delete(`/app/categories/${categoryId}`);
  },
};

export default appAPI;
