import { useEffect, useState } from 'react';
import useTokenStore from '../../../store/tokenStore';
import authService from '../../../services/authService';

/**
 * 海融惠企模块初始化Hook
 * 在模块加载时获取token
 */
export const useHaironghuiqiInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenStore = useTokenStore();

  useEffect(() => {
    const initModule = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 检查是否已经有token
        if (tokenStore.hasToken()) {
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // 获取token
        // appId: 海融惠企应用ID
        // moduleName: haironghuiqi
        const tokenData = await authService.getToken('haironghuiqi', 'haironghuiqi');

        // 保存token到状态管理
        tokenStore.setToken(tokenData);

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize haironghuiqi module:', err);
        setError(err.message || 'Failed to initialize module');
        tokenStore.setError(err.message || 'Failed to get token');
      } finally {
        setIsLoading(false);
      }
    };

    initModule();
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    hasToken: tokenStore.hasToken(),
  };
};

export default useHaironghuiqiInit;
