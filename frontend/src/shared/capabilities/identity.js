import apiClient, { unwrap } from '../api/api';
import useSessionStore from '../auth/sessionStore';
import { appConfig } from '../../app/config/env';

const DEVELOPMENT_TEST_USER = Object.freeze({
  userId: 'test-parent-001',
  displayName: '测试家长',
  roles: ['parent'],
  testProfile: {
    student: {
      name: '李昕然',
      documentType: '居民身份证',
      documentNumber: '320701201901012318',
    },
    guardian: {
      name: '王芳',
      phone: '13800005678',
    },
  },
});

const withDevelopmentProfile = (user) => (
  appConfig.useMockApi && user?.id === DEVELOPMENT_TEST_USER.userId
    ? { ...user, testProfile: DEVELOPMENT_TEST_USER.testProfile }
    : user
);

export const identityCapability = {
  provideAccessToken(accessToken) {
    useSessionStore.getState().setAccessToken(accessToken);
  },

  async getCurrentUser() {
    const user = withDevelopmentProfile(unwrap(await apiClient.get('/auth/me')));
    useSessionStore.getState().setUser(user);
    return user;
  },

  async ensureDevelopmentUser() {
    if (!appConfig.useMockApi) return null;

    if (useSessionStore.getState().accessToken) {
      try {
        return await this.getCurrentUser();
      } catch {
        useSessionStore.getState().clearSession();
      }
    }

    const session = unwrap(await apiClient.post('/auth/development-token', {
      userId: DEVELOPMENT_TEST_USER.userId,
      displayName: DEVELOPMENT_TEST_USER.displayName,
      roles: DEVELOPMENT_TEST_USER.roles,
    }));
    useSessionStore.getState().setAccessToken(session.accessToken);
    return this.getCurrentUser();
  },

  clearSession() {
    useSessionStore.getState().clearSession();
  },
};
