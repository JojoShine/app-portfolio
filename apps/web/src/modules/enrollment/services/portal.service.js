import api from '../../../shared/api/api';

export const portalService = {
  getPortal: () => api.get('/enrollment/portal'),
  getWindows: (filters = {}) => api.get('/enrollment/windows', { params: filters }),
  getContents: (params = {}) => api.get('/enrollment/contents', { params }),
  getFaqs: (params = {}) => api.get('/enrollment/faqs', { params }),
  getGuides: (params = {}) => api.get('/enrollment/guides', { params }),
  searchDistrict: (query) => api.get('/enrollment/districts', {
    params: typeof query === 'string' ? { keyword: query } : query,
  }),
  searchPropertyDegree: (params) => api.get('/enrollment/property-degrees', { params }),
};
