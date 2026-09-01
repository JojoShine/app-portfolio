import api from '../../../shared/api/api';
import { request } from './request';

export const verificationService = {
  runVerifications: (applicationId, types) => request(
    () => api.post(`/enrollment/applications/${encodeURIComponent(applicationId)}/verifications`, {
      authorized: true,
      authorizationVersion: 'v1',
      ...(Array.isArray(types) && types.length ? { types } : {}),
    })
  ),
};
