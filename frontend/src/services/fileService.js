import axios from 'axios';
import useTokenStore from '../store/tokenStore';

/**
 * 文件服务
 * 处理文件流获取和blob URL转换
 * 使用单独的axios实例，避免通用api拦截器的影响
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建单独的axios实例用于文件服务
const fileAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 添加请求拦截器，用于添加token
fileAxios.interceptors.request.use(
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

// 获取文件流并转换为blob URL
export const getFileUrl = async (fileIdOrPath) => {
  try {
    const response = await fileAxios.get(`/files/${fileIdOrPath}`, {
      responseType: 'blob',
    });

    // 将blob转换为URL
    const blobUrl = URL.createObjectURL(response.data);
    return blobUrl;
  } catch (error) {
    console.error('获取文件失败:', error);
    throw error;
  }
};

export default {
  getFileUrl,
};
