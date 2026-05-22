import api from '../../../services/api';
import { handleResponse, handleListResponse } from '../../../services/responseHandler';

/**
 * 机构相关 Service 层
 */

// 获取所有机构
export const getAllInstitutions = async () => {
  const response = await api.get('/haironghuiqi/institutions');
  return handleListResponse(response);
};

// 获取机构列表
export const getInstitutionList = async (params = {}) => {
  const response = await api.get('/haironghuiqi/institutions', { params });
  return handleListResponse(response);
};

// 按分类获取机构
export const getInstitutionsByCategory = async (category) => {
  const response = await api.get(`/haironghuiqi/institutions/category/${category}`);
  return handleListResponse(response);
};

// 获取机构详情
export const getInstitutionDetail = async (institutionId) => {
  const response = await api.get(`/haironghuiqi/institutions/${institutionId}`);
  return handleResponse(response);
};

// 获取机构关联的产品列表
export const getInstitutionProducts = async (institutionId, params = {}) => {
  const response = await api.get(`/haironghuiqi/institutions/${institutionId}/products`, { params });
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

export default {
  getAllInstitutions,
  getInstitutionList,
  getInstitutionsByCategory,
  getInstitutionDetail,
  getInstitutionProducts,
  searchInstitutions,
};
