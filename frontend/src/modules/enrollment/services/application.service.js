import api from '../../../shared/api/api';
import { normalizeApplication } from './mappers';

const requireApplicationId = (applicationId) => {
  if (!applicationId) throw new Error('报名草稿尚未创建，请返回数据预处理页面重试');
};

export const applicationService = {
  createDraft: (input) => api.post('/enrollment/applications', input),
  confirmPolicy: (applicationId, policyVersion) => api.post(
    `/enrollment/applications/${encodeURIComponent(applicationId)}/policy-confirmation`,
    { confirmed: true, policyVersion },
  ),
  saveDraft: (applicationId, expectedVersion, data, identity = {}, verificationModificationReasons = {}) => {
    requireApplicationId(applicationId);
    return api.patch(`/enrollment/applications/${encodeURIComponent(applicationId)}/draft`, {
      expectedVersion,
      data,
      ...identity,
      verificationModificationReasons,
    });
  },
  submitApplication: (applicationId, expectedVersion) => {
    requireApplicationId(applicationId);
    return api.post(`/enrollment/applications/${encodeURIComponent(applicationId)}/submit`, {
      expectedVersion,
      truthConfirmed: true,
      declarationVersion: 'v1',
      idempotencyKey: globalThis.crypto?.randomUUID?.() || `submit-${Date.now()}`,
    });
  },
  listApplications: async (params = {}) => {
    const applications = await api.get('/enrollment/applications', { params });
    return (applications || []).map(normalizeApplication);
  },
  getApplication: async (applicationId) => normalizeApplication(
    await api.get(`/enrollment/applications/${encodeURIComponent(applicationId)}`)
  ),
};
