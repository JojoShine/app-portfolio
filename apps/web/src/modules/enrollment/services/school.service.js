import api from '../../../shared/api/api';
import { normalizeSchool } from './mappers';

export const schoolService = {
  getSchools: async (filters) => {
    const schools = await api.get('/enrollment/schools', { params: filters });
    return (schools || []).map(normalizeSchool);
  },
  getSchoolPolicy: async (schoolId) => normalizeSchool(
    await api.get(`/enrollment/schools/${encodeURIComponent(schoolId)}/policy`)
  ),
};
