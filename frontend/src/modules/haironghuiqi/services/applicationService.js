import api from '../../../services/api';
import { handleResponse, handleListResponse } from '../../../services/responseHandler';

/**
 * 海融惠企模块申请业务 Service 层
 */

// 创建申请
export const createApplication = async (applicationData) => {
  const response = await api.post('/haironghuiqi/applications', applicationData);
  return handleResponse(response);
};

// 获取用户的申请列表
export const getUserApplications = async (userId, params = {}) => {
  const response = await api.get(`/haironghuiqi/users/${userId}/applications`, { params });
  return handleListResponse(response);
};

// 获取申请详情
export const getApplicationDetail = async (applicationId) => {
  const response = await api.get(`/haironghuiqi/applications/${applicationId}`);
  return handleResponse(response);
};

// 更新申请状态
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.put(`/haironghuiqi/applications/${applicationId}/status`, { status });
  return handleResponse(response);
};

// 删除申请
export const deleteApplication = async (applicationId) => {
  const response = await api.delete(`/haironghuiqi/applications/${applicationId}`);
  return handleResponse(response);
};

// 批量提交申请
export const submitApplications = async (applicationIds) => {
  const response = await api.post('/haironghuiqi/applications/batch/submit', { applicationIds });
  return handleResponse(response);
};

export default {
  createApplication,
  getUserApplications,
  getApplicationDetail,
  updateApplicationStatus,
  deleteApplication,
  submitApplications,
};
