import apiClient from '../api/api';
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
  async ensureLocalSession() {
    const store = useSessionStore.getState();
    if (store.accessToken && !store.accessToken.startsWith('mock-')) {
      try {
        const user = await apiClient.get('/auth/me', { networkOnly: true });
        store.setUser(user);
        return user;
      } catch (error) {
        if (error.status !== 401) throw error;
      }
    }
    if (!import.meta.env.DEV) throw new Error('请通过外层应用登录后再进入');
    // 与图书馆共用预置身份；服务端仍检查开发环境与回环地址。
    const session = await apiClient.post('/auth/development-token', {
      userId: DEVELOPMENT_TEST_USER.userId, displayName: '王芳', roles: ['reader', 'parent', 'citizen'],
    }, { networkOnly: true });
    store.setAccessToken(session.accessToken);
    const user = await apiClient.get('/auth/me', { networkOnly: true });
    store.setUser(user);
    return user;
  },
  provideAccessToken(accessToken) {
    useSessionStore.getState().setAccessToken(accessToken);
  },

  async getCurrentUser() {
    const user = withDevelopmentProfile(await apiClient.get('/auth/me'));
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

    const session = await apiClient.post('/auth/development-token', {
      userId: DEVELOPMENT_TEST_USER.userId,
      displayName: DEVELOPMENT_TEST_USER.displayName,
      roles: DEVELOPMENT_TEST_USER.roles,
    });
    useSessionStore.getState().setAccessToken(session.accessToken);
    return this.getCurrentUser();
  },

  clearSession() {
    useSessionStore.getState().clearSession();
  },
};
