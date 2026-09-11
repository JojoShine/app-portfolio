import useSessionStore from '../../../shared/auth/sessionStore';
import { createState, dispatch } from './engine';
export function quizMockApiAdapter(config) {
  const path = new URL(config.url, 'http://mock.local').pathname.replace(/^\/app-portfolio\/api|^\/api/, '');
  if (!path.startsWith('/quiz/')) return null;
  const key = `quiz-v1:${useSessionStore.getState().user?.id || 'demo'}`;
  const run = () => {
    let payload;
    try {
      const stored = localStorage.getItem(key);
      const state = stored ? JSON.parse(stored) : createState();
      if (state.version !== 1) throw new Error('活动记录版本不兼容');
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      let result;
      try { result = dispatch(state, path.split('/').pop(), body); }
      finally { localStorage.setItem(key, JSON.stringify(state)); }
      payload = { code: 0, data: result };
    } catch (error) { payload = { code: 1001, message: error.message || '记录保存失败，请重试' }; }
    return { data: payload, status: 200, statusText: 'OK', headers: {}, config };
  };
  return navigator.locks ? navigator.locks.request(key, run) : Promise.resolve(run());
}
