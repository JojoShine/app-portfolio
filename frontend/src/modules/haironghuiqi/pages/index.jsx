import React from 'react';
import { Outlet } from 'react-router-dom';
import useHaironghuiqiInit from '../hooks/useHaironghuiqiInit';

/**
 * 海融惠企模块主页面
 * 用户登录选择不同类型金融产品，并自动生成申请需求的平台
 */
const HaironghuiqiModule = () => {
  const { isInitialized, isLoading, error, hasToken } = useHaironghuiqiInit();

  // 加载中
  if (isLoading) {
    return (
      <div className="haironghuiqi-module flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">初始化模块中...</p>
        </div>
      </div>
    );
  }

  // 初始化失败
  if (error || !hasToken) {
    return (
      <div className="haironghuiqi-module flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">模块初始化失败</p>
          <p className="text-gray-600">{error || '无法获取访问令牌'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 初始化成功
  return (
    <div className="haironghuiqi-module">
      <Outlet />
    </div>
  );
};

export default HaironghuiqiModule;