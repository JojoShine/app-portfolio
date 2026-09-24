import api from '../../../shared/api/api';
export const uploadPhoto = (file) => {
  const body = new FormData();
  body.append('file', file);
  return api.post('/snap-report/photos', body, { timeout: 45000 });
};
export const photoBlob = (id) => api.get(`/files/${id}`, { responseType: 'blob' });
export const analyzePhotos = (fileIds) => api.post('/snap-report/analyses', { fileIds }, { timeout: 60000 });
