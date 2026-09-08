import api from '../../../shared/api/api';

export const materialService = {
  addMaterial: (applicationId, input) => api.post(
    `/enrollment/applications/${encodeURIComponent(applicationId)}/materials`,
    input,
  ),
  removeMaterial: (applicationId, materialId) => api.delete(
    `/enrollment/applications/${encodeURIComponent(applicationId)}/materials/${encodeURIComponent(materialId)}`
  ),
};
