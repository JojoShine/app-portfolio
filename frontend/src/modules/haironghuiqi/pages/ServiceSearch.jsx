import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, ShoppingCart } from 'lucide-react';
import haironghuiqiService from '../services/haironghuiqiService';
import InstitutionCard from '../components/InstitutionCard';
import ProductCard from '../components/ProductCard';

/**
 * 业务查询页面
 * 展示最新政策、机构查询、金融超市等功能
 */
const ServiceSearch = () => {
  const navigate = useNavigate();

  // 从URL参数中获取分类信息
  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get('category');

  const [activeTab, setActiveTab] = useState('institution'); // 'institution' 或 'supermarket'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPolicy, setLatestPolicy] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [allTags, setAllTags] = useState([]);

  const categories = [
    { id: 'all', name: '全部分类' },
    { id: 'bank', name: '银行' },
    { id: 'insurance', name: '保险' },
    { id: 'securities', name: '证券' },
  ];

  // 获取最新政策
  useEffect(() => {
    const fetchLatestPolicy = async () => {
      try {
        const policies = await haironghuiqiService.getPolicyList({ page: 1, pageSize: 1 });
        if (policies && policies.length > 0) {
          setLatestPolicy(policies[0]);
        }
      } catch (err) {
        console.error('获取最新政策失败:', err);
      }
    };

    fetchLatestPolicy();
  }, []);

  // 获取产品列表和标签
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let productList;
        // 根据selectedCategory获取产品
        if (selectedCategory && selectedCategory !== 'all') {
          productList = await haironghuiqiService.getProductsByCategory(selectedCategory, { page: 1, pageSize: 100 });
        } else {
          productList = await haironghuiqiService.getProductList({ page: 1, pageSize: 100 });
        }
        setProducts(productList);

        // 提取所有唯一的标签
        const tagsSet = new Set();
        productList.forEach((product) => {
          if (product.tags && Array.isArray(product.tags)) {
            product.tags.forEach((tag) => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet));
      } catch (err) {
        console.error('获取产品列表失败:', err);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // 获取机构列表
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);
        setError(null);
        let institutions;
        if (searchQuery) {
          institutions = await haironghuiqiService.searchInstitutions(searchQuery, selectedCategory);
        } else if (selectedCategory && selectedCategory !== 'all') {
          institutions = await haironghuiqiService.getInstitutionsByCategory(selectedCategory);
        } else {
          institutions = await haironghuiqiService.getAllInstitutions();
        }
        setInstitutions(institutions);
      } catch (err) {
        console.error('获取机构列表失败:', err);
        setError(err.message || '获取机构列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [searchQuery, selectedCategory]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-screen min-h-screen" style={{ background: 'linear-gradient(180deg, #eef2f7 0%, #f8fafc 50%, #eef2f7 100%)' }}>
      {/* 顶部装饰背景 */}
      <div className="fixed top-0 left-0 right-0 h-[6vh] bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none" />

      {/* 主内容区域 */}
      <main className="relative px-[4vw] pt-[3vh] pb-[3vh] max-w-2xl mx-auto w-full">
        {/* 最新政策卡片 */}
        <section className="mb-[3vh]">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 p-[2vh] text-white shadow-lg">
            {/* 装饰元素 */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-5 rounded-full"></div>

            {/* 内容区域 */}
            <div className="relative z-10 pr-[10vh]">
              <div className="flex items-center gap-[1vh] mb-[0.8vh]">
                <span className="bg-yellow-400 text-blue-900 px-[0.8vh] py-[0.3vh] rounded text-[1.3vh] font-bold uppercase tracking-wider">最新</span>
              </div>
              <h2 className="font-semibold text-[2vh] leading-tight mb-[0.5vh]">
                {latestPolicy?.title || '新的全球资产保护标准'}
              </h2>
              <p className="text-white/70 text-[1.5vh] line-clamp-2">
                {latestPolicy?.content || '了解机构风险管理和数字安全协议的强制性更新。'}
              </p>
            </div>

            {/* 右侧按钮 - 绝对定位 */}
            <div className="absolute right-[2vh] top-1/2 -translate-y-1/2 z-10">
              <button onClick={() => navigate('/haironghuiqi/policy')} className="inline-flex items-center gap-[0.5vh] text-yellow-400 hover:underline transition-all text-[1.5vh] font-semibold bg-transparent border-none cursor-pointer whitespace-nowrap">
                了解更多 →
              </button>
            </div>
          </div>
        </section>

        {/* Tab 切换 */}
        <nav className="mb-[2vh]">
          <div className="flex rounded-2xl p-[0.5vh]" style={{ background: 'rgba(200,215,240,0.3)', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setActiveTab('institution')}
              className={`flex-1 py-[1.5vh] text-center rounded-xl font-semibold transition-all text-[1.75vh] flex items-center justify-center gap-[0.8vh] ${
                activeTab === 'institution'
                  ? 'bg-white text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size="2vh" />
              机构查询
            </button>
            <button
              onClick={() => setActiveTab('supermarket')}
              className={`flex-1 py-[1.5vh] text-center rounded-xl font-semibold transition-all text-[1.75vh] flex items-center justify-center gap-[0.8vh] ${
                activeTab === 'supermarket'
                  ? 'bg-white text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart size="2vh" />
              金融超市
            </button>
          </div>
        </nav>

        {/* 机构查询内容 */}
        {activeTab === 'institution' && (
          <div>
            {/* 搜索框 */}
            <div className="mb-[2vh]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索机构名称..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full h-[6vh] px-[2vh] rounded-xl focus:outline-none transition-all text-gray-800 placeholder:text-gray-400 text-[1.75vh]"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(200,215,240,0.5)',
                    boxShadow: '0 2px 12px rgba(30,58,138,0.04)',
                  }}
                />
              </div>
            </div>

            {/* 加载状态 */}
            {loading && (
              <div className="text-center py-[6vh]">
                <p className="text-gray-500 text-[1.75vh]">加载中...</p>
              </div>
            )}

            {/* 错误状态 */}
            {error && (
              <div className="text-center py-[6vh]">
                <p className="text-red-500 text-[1.75vh]">{error}</p>
              </div>
            )}

            {/* 机构卡片列表 */}
            {!loading && !error && (
              <div className="space-y-[1.5vh]">
                {institutions.length > 0 ? (
                  institutions.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} />
                  ))
                ) : (
                  <div className="text-center py-[6vh]">
                    <p className="text-gray-500 text-[1.75vh]">暂无机构数据</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 金融超市内容 */}
        {activeTab === 'supermarket' && (
          <div>
            {/* 产品标签 */}
            {allTags.length > 0 && (
              <div className="flex gap-[1vh] mb-[2vh] overflow-x-auto pb-[1vh] hide-scrollbar">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-[2vh] py-[1vh] rounded-full whitespace-nowrap text-[1.4vh] font-semibold transition-all ${
                    selectedTag === 'all'
                      ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={selectedTag !== 'all' ? { background: 'rgba(200,215,240,0.3)' } : {}}
                >
                  全部
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-[2vh] py-[1vh] rounded-full whitespace-nowrap text-[1.4vh] font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={selectedTag !== tag ? { background: 'rgba(200,215,240,0.3)' } : {}}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* 产品列表 */}
            <div className="space-y-[2vh]">
              {products.length > 0 ? (
                products
                  .filter((product) => selectedTag === 'all' || (product.tags && product.tags.includes(selectedTag)))
                  .map((product) => (
                    <ProductCard key={product.id} product={product} isFeatured={product.isFeatured} />
                  ))
              ) : (
                <div className="text-center py-[6vh]">
                  <p className="text-gray-500 text-[1.75vh]">暂无产品数据</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ServiceSearch;
