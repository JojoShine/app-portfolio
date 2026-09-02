import api from '../../../shared/api/api';

export const appService = {
  list: async () => (await api.get('/app/apps')) || [],
};
