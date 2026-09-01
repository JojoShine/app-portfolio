import api, { unwrap } from '../../../shared/api/api';

export const appService = {
  list: async () => unwrap(await api.get('/app/apps')) || [],
};
