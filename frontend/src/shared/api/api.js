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

api.interceptors.request.use((config) => {
  const accessToken = useSessionStore.getState().accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) useSessionStore.getState().clearSession();
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

export const unwrap = (payload) => {
  if (!payload || payload.code !== 0) {
    throw new ApiClientError(payload?.message || '业务请求失败', {
      code: payload?.code,
      requestId: payload?.requestId,
    });
  }
  return payload.data;
};

export const configureApiAdapter = (adapter) => {
  api.defaults.adapter = adapter;
};

export default api;
