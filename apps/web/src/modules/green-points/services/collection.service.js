import api from '../../../shared/api/api';
export const toggleFavorite = id => api.post('/green-points/favorite', { id });
export const recordView = id => api.post('/green-points/view', { id });
