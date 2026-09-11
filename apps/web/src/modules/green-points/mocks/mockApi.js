import { createState, dispatch, upgradeState } from './engine';
import useSessionStore from '../../../shared/auth/sessionStore';
export function greenPointsMockApiAdapter(config) {
  const path = new URL(config.url, 'http://mock.local').pathname.replace(/^\/api/, '');
  if (!path.startsWith('/green-points/')) return null;
  const execute = () => {
    const user = useSessionStore.getState().user;
    const key = `green-points-v1:${user?.id || 'demo'}`;
    let s;
    try {
      s = JSON.parse(localStorage.getItem(key));
    } catch {
      s = null;
    }
    if (!s || s.version !== 1) s = createState();
    upgradeState(s);
    let payload;
    try {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
      const action = path.split('/').pop();
      const result = dispatch(s, action, body);
      localStorage.setItem(key, JSON.stringify(s));
      payload = {
        code: 0,
        data: structuredClone(result)
      };
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(s));
      payload = {
        code: 1001,
        message: error.message
      };
    }
    return {
      data: payload,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  };
  return navigator.locks ? navigator.locks.request('green-points-state', execute) : Promise.resolve(execute());
}
