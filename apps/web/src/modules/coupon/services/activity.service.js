import api from '../../../shared/api/api';
export const listActivities = () => api.get('/coupon/activities');
export const getActivity = (id) => api.get(`/coupon/activities/${encodeURIComponent(id)}`);
