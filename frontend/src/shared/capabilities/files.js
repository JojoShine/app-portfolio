import apiClient, { unwrap } from '../api/api';

export const fileCapability = {
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    return unwrap(await apiClient.post('/files', formData));
  },

  async createObjectUrl(fileId) {
    const blob = await apiClient.get(`/files/${encodeURIComponent(fileId)}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(blob);
  },

  releaseObjectUrl(url) {
    URL.revokeObjectURL(url);
  },
};
