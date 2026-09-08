import api from '../../../shared/api/api';

export const publicationService = {
  getCaptcha: () => api.get('/enrollment/public/captcha'),
  publicQuery: (type, input) => api.post(`/enrollment/public/${encodeURIComponent(type)}/query`, input),
};
