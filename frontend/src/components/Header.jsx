import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

/**
 * 页面头部导航组件
 */
const Header = ({ title, showBackButton = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="返回"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <button
          onClick={handleHome}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="返回首页"
        >
          <Home className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header;
