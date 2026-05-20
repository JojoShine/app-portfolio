import api from '../../../services/api';

/**
 * 海融惠企模块业务 Service 层
 * 处理与后端的数据交互
 */

// 获取金融产品列表
export const getProductList = async (params = {}) => {
  try {
    const response = await api.get('/haironghuiqi/products', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取产品详情
export const getProductDetail = async (productId) => {
  try {
    const response = await api.get(`/haironghuiqi/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取所有机构
export const getAllInstitutions = async () => {
  try {
    const response = await api.get('/haironghuiqi/institutions');
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

// 按分类获取机构
export const getInstitutionsByCategory = async (category) => {
  try {
    const response = await api.get(`/haironghuiqi/institutions/category/${category}`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

// 搜索机构
export const searchInstitutions = async (query, category = null) => {
  try {
    const params = { query };
    if (category && category !== 'all') {
      params.category = category;
    }
    const response = await api.get('/haironghuiqi/search', { params });
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

// 获取机构列表
export const getInstitutionList = async (params = {}) => {
  try {
    const response = await api.get('/haironghuiqi/institutions', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取机构详情
export const getInstitutionDetail = async (institutionId) => {
  try {
    const response = await api.get(`/haironghuiqi/institutions/${institutionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 创建申请需求
export const createApplication = async (applicationData) => {
  try {
    const response = await api.post('/haironghuiqi/applications', applicationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取申请列表
export const getApplicationList = async (params = {}) => {
  try {
    const response = await api.get('/haironghuiqi/applications', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取申请详情
export const getApplicationDetail = async (applicationId) => {
  try {
    const response = await api.get(`/haironghuiqi/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取政策列表
export const getPolicyList = async (params = {}) => {
  try {
    const response = await api.get('/haironghuiqi/policies', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取政策详情
export const getPolicyDetail = async (policyId) => {
  try {
    const response = await api.get(`/haironghuiqi/policies/${policyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 收藏机构
export const collectInstitution = async (institutionId) => {
  try {
    const response = await api.post(`/haironghuiqi/collections/institutions/${institutionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 取消收藏机构
export const uncollectInstitution = async (institutionId) => {
  try {
    const response = await api.delete(`/haironghuiqi/collections/institutions/${institutionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 收藏产品
export const collectProduct = async (productId) => {
  try {
    const response = await api.post(`/haironghuiqi/collections/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 取消收藏产品
export const uncollectProduct = async (productId) => {
  try {
    const response = await api.delete(`/haironghuiqi/collections/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getProductList,
  getProductDetail,
  getInstitutionList,
  getInstitutionDetail,
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