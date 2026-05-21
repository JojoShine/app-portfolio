import api from '../../../services/api';
import { handleResponse, handleListResponse } from '../../../services/responseHandler';

/**
 * 海融惠企模块业务 Service 层
 * 处理与后端的数据交互，返回处理后的数据给页面
 */

// 获取所有机构
export const getAllInstitutions = async () => {
  const response = await api.get('/haironghuiqi/institutions');
  return handleListResponse(response);
};

// 按分类获取机构
export const getInstitutionsByCategory = async (category) => {
  const response = await api.get(`/haironghuiqi/institutions/category/${category}`);
  return handleListResponse(response);
};

// 搜索机构
export const searchInstitutions = async (query, category = null) => {
  const params = { query };
  if (category && category !== 'all') {
    params.category = category;
  }
  const response = await api.get('/haironghuiqi/search', { params });
  return handleListResponse(response);
};

// 获取机构详情
export const getInstitutionDetail = async (institutionId) => {
  const response = await api.get(`/haironghuiqi/institutions/${institutionId}`);
  return handleResponse(response);
};

// 获取金融产品列表
export const getProductList = async (params = {}) => {
  const response = await api.get('/haironghuiqi/products', { params });
  return handleListResponse(response);
};

// 获取产品详情
export const getProductDetail = async (productId) => {
  const response = await api.get(`/haironghuiqi/products/${productId}`);
  return handleResponse(response);
};

// 获取机构关联的产品列表
export const getInstitutionProducts = async (institutionId, params = {}) => {
  const response = await api.get(`/haironghuiqi/institutions/${institutionId}/products`, { params });
  return handleListResponse(response);
};

// 获取机构列表
export const getInstitutionList = async (params = {}) => {
  const response = await api.get('/haironghuiqi/institutions', { params });
  return handleListResponse(response);
};

// 创建申请需求
export const createApplication = async (applicationData) => {
  const response = await api.post('/haironghuiqi/applications', applicationData);
  return handleResponse(response);
};

// 获取申请列表
export const getApplicationList = async (params = {}) => {
  const response = await api.get('/haironghuiqi/applications', { params });
  return handleListResponse(response);
};

// 获取申请详情
export const getApplicationDetail = async (applicationId) => {
  const response = await api.get(`/haironghuiqi/applications/${applicationId}`);
  return handleResponse(response);
};

// 获取政策列表
export const getPolicyList = async (params = {}) => {
  const response = await api.get('/haironghuiqi/policies', { params });
  return handleListResponse(response);
};

// 获取政策详情
export const getPolicyDetail = async (policyId) => {
  const response = await api.get(`/haironghuiqi/policies/${policyId}`);
  return handleResponse(response);
};

// 收藏机构
export const collectInstitution = async (institutionId) => {
  const response = await api.post(`/haironghuiqi/collections/institutions/${institutionId}`);
  return handleResponse(response);
};

// 取消收藏机构
export const uncollectInstitution = async (institutionId) => {
  const response = await api.delete(`/haironghuiqi/collections/institutions/${institutionId}`);
  return handleResponse(response);
};

// 收藏产品
export const collectProduct = async (productId) => {
  const response = await api.post(`/haironghuiqi/collections/products/${productId}`);
  return handleResponse(response);
};

// 取消收藏产品
export const uncollectProduct = async (productId) => {
  const response = await api.delete(`/haironghuiqi/collections/products/${productId}`);
  return handleResponse(response);
};

export default {
  getProductList,
  getProductDetail,
  getInstitutionList,
  getInstitutionDetail,
  getInstitutionProducts,
  getAllInstitutions,
  getInstitutionsByCategory,
  searchInstitutions,
  createApplication,
  getApplicationList,
  getApplicationDetail,
  getPolicyList,
  getPolicyDetail,
  collectInstitution,
  uncollectInstitution,
  collectProduct,
  uncollectProduct,
};