import api from '../../../shared/api/api';
export const listCoupons = () => api.get('/coupon/wallet');
export const claimCoupon = (ticketId) => api.post('/coupon/wallet', { ticketId });
export const getCoupon = (id) => api.get(`/coupon/wallet/${encodeURIComponent(id)}`);
