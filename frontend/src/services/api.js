import axios from 'axios';
import useTokenStore from '../store/tokenStore';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 标记是否正在刷新token
let isRefreshing = false;
// 等待token刷新的请求队列
let refreshSubscribers = [];

/**
 * 订阅token刷新完成事件
 */
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * 添加订阅者
 */
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// 请求拦截器 - 添加token到请求头
api.interceptors.request.use(
  (config) => {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期和错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且还没有重试过，尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokenStore = useTokenStore.getState();
      const refreshToken = tokenStore.getRefreshToken();

      if (!refreshToken) {
        // 没有refreshToken，清除token并返回错误
        tokenStore.clearToken();
        return Promise.reject(error);
      }

      // 如果已经在刷新token，等待刷新完成
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      // 开始刷新token
      isRefreshing = true;

      try {
        const newTokenData = await authService.refreshToken(refreshToken);
        tokenStore.setToken(newTokenData);

        // 更新原始请求的token
        originalRequest.headers.Authorization = `Bearer ${newTokenData.accessToken}`;

        // 通知所有等待的请求
        onRefreshed(newTokenData.accessToken);

        // 重试原始请求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新token失败，清除token
        tokenStore.clearToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 其他错误
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
