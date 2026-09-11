import api from '../../../shared/api/api';
export const listMerchants = () => api.get('/coupon/merchants');
