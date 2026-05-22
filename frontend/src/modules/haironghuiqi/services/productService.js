import api from '../../../services/api';
import { handleResponse, handleListResponse } from '../../../services/responseHandler';

/**
 * 产品相关 Service 层
 */

// 获取金融产品列表
export const getProductList = async (params = {}) => {
  const response = await api.get('/haironghuiqi/products', { params });
  return handleListResponse(response);
};

// 按分类获取产品列表
export const getProductsByCategory = async (category, params = {}) => {
  const response = await api.get(`/haironghuiqi/products/category/${category}`, { params });
  return handleListResponse(response);
};

// 获取产品详情
export const getProductDetail = async (productId) => {
  const response = await api.get(`/haironghuiqi/products/${productId}`);
  return handleResponse(response);
};

export default {
  getProductList,
  getProductsByCategory,
  getProductDetail,
};
