const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const appConfig = Object.freeze({
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api'),
  routerBaseName: trimTrailingSlash(import.meta.env.BASE_URL || '/') || '/',
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 10000),
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
});
