import axios from 'axios';
import { appConfig } from '../../app/config/env';
import useSessionStore from '../auth/sessionStore';

export class ApiClientError extends Error {
  constructor(message, { status, code, requestId, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  headers: { Accept: 'application/json' },
});
const networkAdapter = axios.getAdapter(api.defaults.adapter);

api.interceptors.request.use((config) => {
  const accessToken = useSessionStore.getState().accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload) || payload instanceof Blob) {
      return payload;
    }
    if (payload.code !== 0) {
      throw new ApiClientError(payload?.message || '业务请求失败', {
        code: payload?.code,
        requestId: payload?.requestId,
      });
    }
    return payload.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().clearSession();
      const config = error.config;
      if (appConfig.publicDemo && config && !config.demoRetried && !config.url?.startsWith('/auth/')) {
        config.demoRetried = true;
        await ensurePublicDemoSession();
        return api(config);
      }
    }
    const payload = error.response?.data;
    return Promise.reject(new ApiClientError(
      payload?.message || error.message || '请求失败',
      {
        status: error.response?.status,
        code: payload?.code,
        requestId: payload?.requestId,
        cause: error,
      }
    ));
  }
);

export const configureApiAdapter = (adapter) => {
  api.defaults.adapter = async (config) => config.networkOnly
    ? networkAdapter(config)
    : (await adapter(config)) ?? networkAdapter(config);
};

export default api;

let demoSessionRequest;
export const ensurePublicDemoSession = async () => {
  if (!appConfig.publicDemo) return;
  if (useSessionStore.getState().accessToken) return;
  if (!demoSessionRequest) {
    demoSessionRequest = api.post('/auth/demo-token', {}, {networkOnly:true})
      .then(session => useSessionStore.getState().setAccessToken(session.accessToken))
      .finally(() => { demoSessionRequest = null; });
  }
  return demoSessionRequest;
};
