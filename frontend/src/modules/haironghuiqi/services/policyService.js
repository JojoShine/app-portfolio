import api from '../../../services/api';
import { handleResponse, handleListResponse } from '../../../services/responseHandler';

/**
 * 政策相关 Service 层
 */

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

export default {
  getPolicyList,
  getPolicyDetail,
};
