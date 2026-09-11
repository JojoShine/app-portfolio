import api from '../../../shared/api/api';
export const redeem = payload => api.post('/green-points/redeem', payload);
export const cancelOrder = id => api.post('/green-points/cancel', {
  id
});
export const completeOrder = id => api.post('/green-points/complete', {
  id
});
