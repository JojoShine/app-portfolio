import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * 模块卡片组件
 * 展示单个模块应用的信息
 */
const ModuleCard = ({ module, onClick }) => {
  const { name, description, icon: Icon, status } = module;
  const isActive = status === 'active';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300
        p-6 cursor-pointer border border-gray-200
        ${isActive ? 'hover:border-blue-400 hover:scale-105' : 'opacity-50 cursor-not-allowed'}
      `}
    >
      {/* 模块图标 */}
      <div className="mb-4">
        {Icon ? (
          <Icon className="w-12 h-12 text-blue-600" />
        ) : (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        )}
      </div>

      {/* 模块名称 */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>

      {/* 模块描述 */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      {/* 状态标签和箭头 */}
      <div className="flex items-center justify-between">
        <span
          className={`
            text-xs font-medium px-3 py-1 rounded-full
            ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
          `}
        >
          {isActive ? '可用' : '即将推出'}
        </span>
        {isActive && (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        )}
      </div>
    </div>
  );
};

export default ModuleCard;

