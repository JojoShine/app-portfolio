import api from '../../../shared/api/api';
export const reverseLocation = (params) => api.get('/snap-report/locations/reverse', { params, timeout: 20000 });
export const searchLocations = (q) => api.get('/snap-report/locations/search', { params: { q } });
