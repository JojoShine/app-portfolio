import api from '../../../shared/api/api';
export const claimCoupon = id => api.post('/green-points/claim-coupon', { id });
