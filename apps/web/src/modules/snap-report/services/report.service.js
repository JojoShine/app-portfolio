import api from '../../../shared/api/api';
export const submitReport = (data) => api.post('/snap-report/reports', data, { timeout: 30000 });
export const listReports = (page = 1) => api.get('/snap-report/reports', { params: { page } });
export const getReport = (id) => api.get(`/snap-report/reports/${id}`);
