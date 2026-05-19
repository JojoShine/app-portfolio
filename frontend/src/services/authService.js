import api from './api';

/**
 * 获取token
 * @param {string} appId - 应用ID
 * @param {string} moduleName - 模块名称
 * @returns {Promise} token数据
 */
export const getToken = async (appId, moduleName) => {
  try {
    const response = await api.post('/auth/token', {
      appId,
      moduleName,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 刷新token
 * @param {string} refreshToken - 刷新token
 * @returns {Promise} 新的token数据
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getToken,
  refreshToken,
};