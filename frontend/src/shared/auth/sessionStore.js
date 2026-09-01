import { create } from 'zustand';

const STORAGE_KEY = 'app-portfolio.session';

const readSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

const readHostAccessToken = () => {
  if (typeof window === 'undefined') return null;
  const injectedToken = window.__APP_CONTEXT__?.accessToken
    || window.__APP_PORTFOLIO__?.accessToken;
  if (injectedToken) return String(injectedToken);
  const params = new URLSearchParams(window.location.search);
  return params.get('access_token') || params.get('token');
};

const writeSession = (session) => {
  if (typeof window === 'undefined') return;
  if (session) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.sessionStorage.removeItem(STORAGE_KEY);
};

const initialSession = readSession();
const defaultMockSession = import.meta.env.VITE_USE_MOCK_API !== 'false'
  ? { accessToken: 'mock-parent-access-token', user: null }
  : null;
const hostAccessToken = readHostAccessToken();
const resolvedInitialSession = initialSession
  || (hostAccessToken ? { accessToken: hostAccessToken, user: null } : null)
  || defaultMockSession;

const useSessionStore = create((set, get) => ({
  accessToken: resolvedInitialSession?.accessToken || null,
  user: resolvedInitialSession?.user || null,
  setAccessToken: (accessToken) => {
    writeSession(accessToken ? { accessToken, user: get().user } : null);
    set({ accessToken, user: accessToken ? get().user : null });
  },
  setUser: (user) => {
    const accessToken = get().accessToken;
    writeSession(accessToken ? { accessToken, user } : null);
    set({ user });
  },
  clearSession: () => {
    writeSession(null);
    set({ accessToken: null, user: null });
  },
}));

export default useSessionStore;
