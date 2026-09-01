import api from '../../../shared/api/api';
import { request } from './request';

export const portalService = {
  getPortal: () => request(() => api.get('/enrollment/portal')),
  getWindows: (filters = {}) => request(() => api.get('/enrollment/windows', { params: filters })),
  getContents: (params = {}) => request(() => api.get('/enrollment/contents', { params })),
  getFaqs: (params = {}) => request(() => api.get('/enrollment/faqs', { params })),
  getGuides: (params = {}) => request(() => api.get('/enrollment/guides', { params })),
  searchDistrict: (query) => request(() => api.get('/enrollment/districts', {
    params: typeof query === 'string' ? { keyword: query } : query,
  })),
  searchPropertyDegree: (params) => request(() => api.get('/enrollment/property-degrees', { params })),
};
