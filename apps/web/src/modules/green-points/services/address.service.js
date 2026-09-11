import api from '../../../shared/api/api';
export const saveAddress = payload => api.post('/green-points/save-address', payload);
export const deleteAddress = id => api.post('/green-points/delete-address', { id });
