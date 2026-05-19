import { create } from 'zustand';

/**
 * Token状态管理
 * 存储accessToken、refreshToken、过期时间等信息
 */
const useTokenStore = create((set, get) => ({
  // 状态
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  expiresIn: localStorage.getItem('expiresIn') || null,
  tokenType: localStorage.getItem('tokenType') || 'Bearer',
  isLoading: false,
  error: null,

  // 设置token
  setToken: (tokenData) => {
    const { accessToken, refreshToken, expiresIn, tokenType = 'Bearer' } = tokenData;

    // 保存到localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('expiresIn', expiresIn);
    localStorage.setItem('tokenType', tokenType);

    // 更新状态
    set({
      accessToken,
      refreshToken,
      expiresIn,
      tokenType,
      error: null,
    });
  },

  // 清除token
  clearToken: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenType');

    set({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      tokenType: 'Bearer',
      error: null,
    });
  },

  // 获取accessToken
  getAccessToken: () => {
    return get().accessToken;
  },

  // 获取refreshToken
  getRefreshToken: () => {
    return get().refreshToken;
  },

  // 检查token是否存在
  hasToken: () => {
    return !!get().accessToken;
  },

  // 设置加载状态
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // 设置错误
  setError: (error) => {
    set({ error });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));

export default useTokenStore;
