import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
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
    <div className="w-screen min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <main className="px-4 pt-6 pb-6 max-w-2xl mx-auto w-full">
        {/* 最新政策卡片 */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 min-h-[160px] p-6 flex flex-col justify-between text-white shadow-lg">
            {/* 装饰元素 */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white opacity-5 rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-blue-900 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">最新更新</span>
                <span className="text-white/60 text-xs">今日</span>
              </div>
              <h2 className="font-semibold text-lg leading-tight mb-2">
                {latestPolicy?.title || '新的全球资产保护标准'}
              </h2>
              <p className="text-white/80 text-sm line-clamp-2">
                {latestPolicy?.content || '了解机构风险管理和数字安全协议的强制性更新。'}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between">
              <a href="#" className="inline-flex items-center gap-1 text-yellow-400 hover:underline transition-all text-sm font-semibold">
                了解更多
                <span>→</span>
              </a>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <FileText size={20} className="text-white" />
              </div>
            </div>

            {/* 装饰图标 */}
            <div className="absolute bottom-0 right-0 p-4 opacity-20 pointer-events-none text-6xl">
              ✓
            </div>
          </div>
        </section>

        {/* Tab 切换 */}
        <nav className="mb-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('institution')}
              className={`flex-1 py-3 text-center rounded-lg font-semibold transition-all ${
                activeTab === 'institution'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              机构查询
            </button>
            <button
              onClick={() => setActiveTab('supermarket')}
              className={`flex-1 py-3 text-center rounded-lg font-semibold transition-all ${
                activeTab === 'supermarket'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              金融超市
            </button>
          </div>
        </nav>

        {/* 机构查询内容 */}
        {activeTab === 'institution' && (
          <div>
            {/* 搜索框 */}
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索机构名称..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl focus:border-blue-900 focus:ring-0 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 加载状态 */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">加载中...</p>
              </div>
            )}

            {/* 错误状态 */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {/* 机构卡片列表 */}
            {!loading && !error && (
              <div className="space-y-3">
                {institutions.length > 0 ? (
                  institutions.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">暂无机构数据</p>
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
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
                    selectedTag === 'all'
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  全部
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* 产品列表 */}
            <div className="space-y-4">
              {products.length > 0 ? (
                products
                  .filter((product) => selectedTag === 'all' || (product.tags && product.tags.includes(selectedTag)))
                  .map((product) => (
                    <ProductCard key={product.id} product={product} isFeatured={product.isFeatured} />
                  ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">暂无产品数据</p>
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
