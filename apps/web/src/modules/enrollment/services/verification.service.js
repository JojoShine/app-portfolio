import api from '../../../shared/api/api';

export const verificationService = {
  runVerifications: (applicationId, types) => api.post(
    `/enrollment/applications/${encodeURIComponent(applicationId)}/verifications`,
    {
      authorized: true,
      authorizationVersion: 'v1',
      ...(Array.isArray(types) && types.length ? { types } : {}),
    },
  ),
};
