import api from '../../../shared/api/api';
import { request } from './request';

export const materialService = {
  addMaterial: (applicationId, input) => request(
    () => api.post(`/enrollment/applications/${encodeURIComponent(applicationId)}/materials`, input)
  ),
  removeMaterial: (applicationId, materialId) => request(
    () => api.delete(`/enrollment/applications/${encodeURIComponent(applicationId)}/materials/${encodeURIComponent(materialId)}`)
  ),
};
