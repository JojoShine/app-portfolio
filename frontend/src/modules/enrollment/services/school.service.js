import api from '../../../shared/api/api';
import { normalizeSchool } from './mappers';
import { request } from './request';

export const schoolService = {
  getSchools: async (filters) => {
    const schools = await request(() => api.get('/enrollment/schools', { params: filters }));
    return (schools || []).map(normalizeSchool);
  },
  getSchoolPolicy: async (schoolId) => normalizeSchool(await request(
    () => api.get(`/enrollment/schools/${encodeURIComponent(schoolId)}/policy`)
  )),
};
