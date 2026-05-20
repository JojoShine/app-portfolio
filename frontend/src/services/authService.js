import api from './api';
import { handleResponse } from './responseHandler';

/**
 * 获取token
 * @param {string} appId - 应用ID
 * @param {string} moduleName - 模块名称
 * @returns {Promise} token数据
 */
export const getToken = async (appId, moduleName) => {
  const response = await api.post('/auth/token', {
    appId,
    moduleName,
  });
  return handleResponse(response);
};

/**
 * 刷新token
 * @param {string} refreshToken - 刷新token
 * @returns {Promise} 新的token数据
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', {
    refreshToken,
  });
  return handleResponse(response);
};

export default {
  getToken,
  refreshToken,
};