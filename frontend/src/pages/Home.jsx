import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import appAPI from '../services/appAPI';
import { getIconComponent } from '../utils/iconLoader';

/**
 * 应用门面首页 - 移动端样式
 * 展示所有可用的模块应用
 */
const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [panelSearchQuery, setPanelSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取应用和分类数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appsData, categoriesData] = await Promise.all([
          appAPI.getAllApps(),
          appAPI.getAllCategories(),
        ]);

        setApps(appsData || []);
        setCategories(categoriesData || []);
        setError(null);

        // 如果只有一个应用，自动跳转到该应用
        if (appsData && appsData.length === 1 && appsData[0].status === 'active') {
          navigate(appsData[0].path);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 可用的模块列表
  // 搜索和分类过滤
  const filteredModules = useMemo(() => {
    let result = apps;

    // 按分类过滤（如果选择了某个分类，则只显示该分类的应用）
    if (activeCategory) {
      result = result.filter((app) => app.categoryId === activeCategory);
    }

    // 按搜索词过滤（仅在搜索面板中使用）
    if (showSearchPanel && panelSearchQuery.trim()) {
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(panelSearchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(panelSearchQuery.toLowerCase())
      );
    }

    return result;
  }, [apps, panelSearchQuery, activeCategory, showSearchPanel]);

  const handleModuleClick = (module) => {
    if (module.status === 'active') {
      navigate(module.path);
    }
  };

  // 计算每个分类的应用数量
  const getCategoryCount = (categoryId) => {
    if (!categoryId) {
      // 如果categoryId为null或undefined，表示"全部"
      return apps.length;
    }
    return apps.filter((app) => app.categoryId === categoryId).length;
  };

  // 为每个模块定义背景颜色
  const getModuleColor = (index) => {
    const colors = [
      'bg-blue-50',
      'bg-red-50',
      'bg-green-50',
      'bg-purple-50',
      'bg-yellow-50',
      'bg-pink-50',
      'bg-indigo-50',
      'bg-orange-50',
    ];
    return colors[index % colors.length];
  };

  // 为每个模块定义icon背景颜色
  const getIconBgColor = (index) => {
    const colors = [
      'bg-blue-100',
      'bg-red-100',
      'bg-green-100',
      'bg-purple-100',
      'bg-yellow-100',
      'bg-pink-100',
      'bg-indigo-100',
      'bg-orange-100',
    ];
    return colors[index % colors.length];
  };

  // 为每个模块定义icon颜色
  const getIconColor = (index) => {
    const colors = [
      'text-blue-600',
      'text-red-600',
      'text-green-600',
      'text-purple-600',
      'text-yellow-600',
      'text-pink-600',
      'text-indigo-600',
      'text-orange-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="home-page min-h-screen bg-white flex flex-col hide-scrollbar">
      {/* AppPortfolio 项目介绍 Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-4 py-5 text-white relative overflow-hidden sticky top-0 z-20">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

        {/* 内容 */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3">AppPortfolio</h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-2xl">
            一个H5应用整合矩阵，汇聚各类优质应用服务。我们不定期上线新应用，为您提供更多便捷的服务体验。
          </p>
        </div>
      </div>

      {/* 分类Tab */}
      <div className="fixed left-0 right-0 z-10 bg-white border-b border-gray-200" style={{ top: '130px' }}>
        <div className="px-4 pt-4 flex gap-6 overflow-x-auto hide-scrollbar">
          {/* 全部分类按钮 */}
          <button
            onClick={() => setActiveCategory(null)}
            className={`
              pb-3 pt-3 text-sm font-medium whitespace-nowrap transition-all relative
              ${
                activeCategory === null
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            全部 <span className="text-xs text-gray-500">({getCategoryCount(null)})</span>
            {activeCategory === null && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>

          {/* 其他分类按钮 */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                pb-3 pt-3 text-sm font-medium whitespace-nowrap transition-all relative
                ${
                  activeCategory === category.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {category.name} <span className="text-xs text-gray-500">({getCategoryCount(category.id)})</span>
              {activeCategory === category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 应用方块列表 */}
      <div className="px-4 pt-6 pb-6 flex-1 overflow-y-auto" style={{ marginTop: '36px' }}>
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className={`
                  ${getModuleColor(index)} rounded-lg p-3 cursor-pointer
                  transition-all duration-300 flex flex-col relative
                  ${
                    module.status === 'active'
                      ? 'hover:shadow-lg active:scale-95'
                      : 'opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* 场景化标签 */}
                {module.isScenario && (
                  <div className="absolute top-0 right-0 badge-scenario">
                    场景
                  </div>
                )}

                {/* 左上角icon */}
                <div className={`${getIconBgColor(index)} rounded-lg p-2 w-fit mb-2`}>
                  {module.icon ? (() => {
                    const IconComponent = getIconComponent(module.icon);
                    return <IconComponent className={`w-6 h-6 ${getIconColor(index)}`} />;
                  })() : (
                    <span className="text-sm">📦</span>
                  )}
                </div>

                {/* 应用名称 */}
                <h3 className="text-xs font-semibold text-gray-800 mb-1 line-clamp-2">
                  {module.name}
                </h3>

                {/* 简易说明 */}
                <p className="text-xs text-gray-600 line-clamp-1">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">未找到匹配的应用</p>
          </div>
        )}
      </div>

      {/* 搜索面板 - 从右向左滑出 */}
      {showSearchPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => {
            setShowSearchPanel(false);
            setPanelSearchQuery('');
          }}
        ></div>
      )}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-lg
          transition-transform duration-300 ease-in-out
          ${showSearchPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-4 h-full flex flex-col">
          {/* 关闭按钮 */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">搜索应用</h3>
            <button
              onClick={() => {
                setShowSearchPanel(false);
                setPanelSearchQuery('');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索应用..."
              value={panelSearchQuery}
              onChange={(e) => setPanelSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 搜索结果 */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {filteredModules.length > 0 ? (
              <div className="space-y-2">
                {filteredModules.map((module, index) => (
                  <div
                    key={module.id}
                    onClick={() => {
                      handleModuleClick(module);
                      setShowSearchPanel(false);
                      setPanelSearchQuery('');
                    }}
                    className={`${getModuleColor(index)} p-3 rounded-lg hover:shadow-md cursor-pointer transition-all flex items-start gap-3 relative`}
                  >
                    {/* 场景化标签 */}
                    {module.isScenario && (
                      <div className="absolute top-0 right-0 badge-scenario">
                        场景
                      </div>
                    )}

                    {/* 左侧icon */}
                    <div className={`${getIconBgColor(index)} rounded-lg p-2 w-fit flex-shrink-0`}>
                      {module.icon ? (() => {
                        const IconComponent = getIconComponent(module.icon);
                        return <IconComponent className={`w-5 h-5 ${getIconColor(index)}`} />;
                      })() : (
                        <span className="text-sm">📦</span>
                      )}
                    </div>

                    {/* 右侧文字 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm">{module.name}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">未找到匹配的应用</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 悬浮搜索按钮 */}
      <button
        onClick={() => setShowSearchPanel(true)}
        className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-30 opacity-90 hover:opacity-100"
      >
        <Search className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Home;