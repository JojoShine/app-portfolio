import api from '../../../shared/api/api';
import { request } from './request';

export const publicationService = {
  getCaptcha: () => request(() => api.get('/enrollment/public/captcha')),
  publicQuery: (type, input) => request(
    () => api.post(`/enrollment/public/${encodeURIComponent(type)}/query`, input)
  ),
};
