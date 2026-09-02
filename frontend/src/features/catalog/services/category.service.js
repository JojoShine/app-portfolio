import api from '../../../shared/api/api';

export const categoryService = {
  list: async () => (await api.get('/app/categories')) || [],
};
