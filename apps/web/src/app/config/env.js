const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const appConfig = Object.freeze({
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api'),
  publicSiteUrl: trimTrailingSlash(import.meta.env.VITE_PUBLIC_SITE_URL || ''),
  routerBaseName: trimTrailingSlash(import.meta.env.BASE_URL || '/') || '/',
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 10000),
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
  publicDemo: import.meta.env.VITE_PUBLIC_DEMO === 'true',
});

// 后端返回的根路径资源地址也必须遵循正式环境的 API 前缀。
export const resolveApiResourceUrl = (url) => url?.startsWith('/api/')
  ? `${appConfig.apiBaseUrl}${url.slice(4)}`
  : url;
