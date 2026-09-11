import api from '../../../shared/api/api';
export const submitSupport = payload => api.post('/green-points/support', payload);
