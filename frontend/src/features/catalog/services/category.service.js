import api, { unwrap } from '../../../shared/api/api';

export const categoryService = {
  list: async () => unwrap(await api.get('/app/categories')) || [],
};
