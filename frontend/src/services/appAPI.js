import api from './api';
import { handleResponse, handleListResponse } from './responseHandler';

/**
 * 应用管理 API 服务
 */

const appAPI = {
  // 获取所有分类
  getAllCategories: async () => {
    const response = await api.get('/app/categories');
    return handleListResponse(response);
  },

  // 获取所有应用
  getAllApps: async () => {
    const response = await api.get('/app/apps');
    return handleListResponse(response);
  },

  // 按分类获取应用
  getAppsByCategory: async (categoryId) => {
    const response = await api.get(`/app/apps/category/${categoryId}`);
    return handleListResponse(response);
  },

  // 获取应用详情
  getAppDetail: async (appId) => {
    const response = await api.get(`/app/apps/${appId}`);
    return handleResponse(response);
  },

  // 创建应用
  createApp: async (appData) => {
    const response = await api.post('/app/apps', appData);
    return handleResponse(response);
  },

  // 更新应用
  updateApp: async (appId, appData) => {
    const response = await api.put(`/app/apps/${appId}`, appData);
    return handleResponse(response);
  },

  // 删除应用
  deleteApp: async (appId) => {
    const response = await api.delete(`/app/apps/${appId}`);
    return handleResponse(response);
  },

  // 创建分类
  createCategory: async (categoryData) => {
    const response = await api.post('/app/categories', categoryData);
    return handleResponse(response);
  },

  // 更新分类
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/app/categories/${categoryId}`, categoryData);
    return handleResponse(response);
  },

  // 删除分类
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/app/categories/${categoryId}`);
    return handleResponse(response);
  },
};

export default appAPI;

