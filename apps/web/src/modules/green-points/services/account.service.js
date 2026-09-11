import api from '../../../shared/api/api';
export const readAccount = () => api.get('/green-points/read');
export const checkIn = () => api.post('/green-points/check-in');
