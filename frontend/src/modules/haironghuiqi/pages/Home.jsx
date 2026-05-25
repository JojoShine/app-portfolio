import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Tag } from 'antd-mobile';
import { Heart, ShoppingCart, Scale, Building2, Shield, TrendingUp, Settings } from 'lucide-react';
import bgImage from '../assets/home/bg_new.png';
import logoImage from '../assets/home/logo.png';
import haironghuiqiLogo from '../assets/home/haironghuiqi.png';
import product1 from '../assets/home/1.png';
import product2 from '../assets/home/2.png';
import product3 from '../assets/home/3.png';
import product4 from '../assets/home/4.png';
import product5 from '../assets/home/5.png';
import applicationService from '../services/applicationService';

/**
 * 海融惠企首页
 * 展示品牌和产品分类入口
 */
const HaironghuiqiHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);

  // 获取用户的申请数量
  useEffect(() => {
    const fetchApplicationCount = async () => {
      try {
        // TODO: 从userService获取用户信息，暂时使用默认值
        const userId = 'test-user-id';
        const result = await applicationService.getUserApplications(userId, { page: 1, pageSize: 1 });
        if (result && result.pagination) {
          setCollectionCount(result.pagination.total);
        }
      } catch (error) {
        console.error('获取申请数量失败:', error);
        setCollectionCount(0);
      }
    };

    fetchApplicationCount();
  }, []);

  // 产品分类数据
  const products = [
    { id: 1, image: product1, title: '金融政策', subtitle: '金融政策惠民', category: 'policy' },
    { id: 2, image: product2, title: '银行', subtitle: '便民金融相随', category: 'bank' },
    { id: 3, image: product3, title: '保险', subtitle: '普惠万家安康', category: 'insurance' },
    { id: 4, image: product4, title: '证券', subtitle: '守护投资收益', category: 'securities' },
    { id: 5, image: product5, title: '其他金融', subtitle: '安全融通无忧', category: 'other' },
  ];

  const handleProductClick = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product.category === 'policy') {
      // 导航到金融政策页面（后续开发）
      navigate('/haironghuiqi/policy');
    } else {
      // 导航到业务查询页面，并传递分类参数
      navigate(`/haironghuiqi/service-search?category=${product.category}`);
    }
  };

  return (
    <div className="haironghuiqi-home w-screen h-screen overflow-hidden bg-blue-900">
      {/* 背景 - fixed */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          zIndex: 0,
        }}
      />

      {/* 背景叠加效果 - 严格按照code.html的设计 */}
      <div className="fixed inset-0 bg-blue-900/40 mix-blend-multiply" style={{ zIndex: 1 }} />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900/60 via-transparent to-blue-900/80" style={{ zIndex: 1 }} />

      {/* 主内容区域 */}
      <main className="relative z-10 flex-grow px-4 pt-6 pb-32 overflow-y-auto h-screen">
        {/* Logo - 顶部 */}
        <div className="flex justify-center mb-10 pt-6">
          <img
            src={logoImage}
            alt="海融惠企"
            className="h-12 object-contain"
            style={{
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>

        {/* 欢迎部分 */}
        <section className="mb-6">
          <img src={haironghuiqiLogo} alt="海融惠企" className="h-7 mb-3" />
          <p className="text-white/80 text-sm w-2/3 leading-relaxed">一站式金融服务平台，汇聚银行、保险、证券等多类金融机构，为您提供专业的金融解决方案和优质的金融产品。</p>
        </section>

        {/* 产品分类网格 - 严格按照code.html的布局 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Financial Policy - 占据2列 */}
          <button
            onClick={() => handleProductClick(1)}
            className="col-span-2 glass-card rounded-xl p-6 flex flex-col justify-between items-start h-44 shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-left"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div className="bg-yellow-400/80 text-gray-800 p-2 rounded-lg mb-3 group-hover:scale-110 transition-transform">
              <Scale size={24} />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{products[0].title}</p>
              <p className="text-white/70 text-xs mt-2 leading-relaxed">了解最新的金融政策动向，获取政策解读和指导，帮助您更好地理解金融监管环境。</p>
            </div>
          </button>

          {/* Banking - 占据1列 */}
          <button
            onClick={() => handleProductClick(2)}
            className="col-span-1 glass-card rounded-xl p-3 flex flex-col items-center justify-center h-40 shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <Building2 size={24} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm line-clamp-2">{products[1].title}</span>
            <p className="text-white/70 text-xs mt-1">{products[1].subtitle}</p>
          </button>

          {/* Insurance - 占据1列 */}
          <button
            onClick={() => handleProductClick(3)}
            className="col-span-1 glass-card rounded-xl p-3 flex flex-col items-center justify-center h-40 shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm line-clamp-2">{products[2].title}</span>
            <p className="text-white/70 text-xs mt-1">{products[2].subtitle}</p>
          </button>

          {/* Securities - 占据1列 */}
          <button
            onClick={() => handleProductClick(4)}
            className="col-span-1 glass-card rounded-xl p-3 flex flex-col items-center justify-center h-40 shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm line-clamp-2">{products[3].title}</span>
            <p className="text-white/70 text-xs mt-1">{products[3].subtitle}</p>
          </button>

          {/* Other Services - 占据1列 */}
          <button
            onClick={() => handleProductClick(5)}
            className="col-span-1 glass-card rounded-xl p-3 flex flex-col items-center justify-center h-40 shadow-lg group hover:scale-105 active:scale-95 transition-all duration-300 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <Settings size={24} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm line-clamp-2">{products[4].title}</span>
            <p className="text-white/70 text-xs mt-1">{products[4].subtitle}</p>
          </button>
        </div>
      </main>

      {/* 购物车浮动按钮 */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => {
            navigate('/haironghuiqi/my-applications');
          }}
          className="relative w-16 h-16 bg-blue-900 hover:bg-blue-800 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-90"
          style={{
            cursor: 'pointer',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3), 0 10px 20px rgba(15, 23, 42, 0.2)',
          }}
        >
          <ShoppingCart size={32} className="text-white" />
          {/* 角标 */}
          {collectionCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-900">
              {collectionCount}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default HaironghuiqiHome;