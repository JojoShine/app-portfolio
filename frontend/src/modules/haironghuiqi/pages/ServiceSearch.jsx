import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import policyImage from '../assets/service_search/policy.png';
import selectedImage from '../assets/service_search/selected.png';
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
    <div className="service-search w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8' }}>
      {/* 最新政策卡片 */}
      <div className="px-[4vw] pt-[2vh]">
        <div
          className="flex gap-[3vw] p-[3vw] rounded-lg"
          style={{
            backgroundColor: '#ffffff',
          }}
        >
          {/* 左侧：渐变背景方形 */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: '12vw',
              height: '12vw',
              background: 'linear-gradient(to bottom, #0283EB, #78C3FF)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '4vw',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  lineHeight: 1.2,
                }}
              >
                最新
              </div>
              <div
                style={{
                  fontSize: '4vw',
                  fontWeight: 'bold',
                  color: '#FFD700',
                  lineHeight: 1.2,
                }}
              >
                政策
              </div>
            </div>
          </div>

          {/* 右侧：政策信息 */}
          <div className="flex-1 flex flex-col justify-center">
            <h4
              style={{
                fontSize: '3.5vw',
                fontWeight: 600,
                color: '#333333',
                marginBottom: '1vh',
                lineHeight: 1.4,
              }}
            >
              {latestPolicy?.title || '关于进一步推进金融服务'}
            </h4>
            <p
              style={{
                fontSize: '3vw',
                color: '#999999',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {latestPolicy?.content || '深入贯彻落实金融服务实体经济的重要决策部署'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex mt-[0.2vh]">
        <button
          onClick={() => setActiveTab('institution')}
          className="flex-1 py-[2vh] text-center transition-colors relative"
          style={{
            color: activeTab === 'institution' ? '#0A172A' : '#333C59',
            fontSize: activeTab === 'institution' ? '4.3vw' : '4vw',
            fontWeight: activeTab === 'institution' ? 'bold' : 'normal',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          机构查询
          {activeTab === 'institution' && (
            <img
              src={selectedImage}
              alt="selected"
              style={{
                position: 'absolute',
                bottom: '1.5vh',
                right: '12vw',
                width: '3.5vw',
                height: '3.5vw',
              }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('supermarket')}
          className="flex-1 py-[2vh] text-center transition-colors relative"
          style={{
            color: activeTab === 'supermarket' ? '#0A172A' : '#333C59',
            fontSize: activeTab === 'supermarket' ? '4.3vw' : '4vw',
            fontWeight: activeTab === 'supermarket' ? 'bold' : 'normal',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          金融超市
          {activeTab === 'supermarket' && (
            <img
              src={selectedImage}
              alt="selected"
              style={{
                position: 'absolute',
                bottom: '1.5vh',
                right: '12vw',
                width: '3.5vw',
                height: '3.5vw',
              }}
            />
          )}
        </button>
      </div>

      {/* 机构查询内容 */}
      {activeTab === 'institution' && (
        <div className="px-[4vw]">
          {/* 搜索框 */}
          <div className="mb-[2vh]">
            <div className="flex items-center bg-white rounded-lg px-[3vw] py-[1.5vh] mb-[1vh]" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Search size={18} style={{ color: '#999999', marginRight: '1vw' }} />
              <input
                type="text"
                placeholder="搜索机构名称"
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: '3.5vw', color: '#333333' }}
              />
            </div>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '5vh 0' }}>
              <p style={{ fontSize: '3.5vw', color: '#999999' }}>加载中...</p>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div style={{ textAlign: 'center', padding: '5vh 0' }}>
              <p style={{ fontSize: '3.5vw', color: '#FF4444' }}>{error}</p>
            </div>
          )}

          {/* 机构卡片列表 */}
          {!loading && !error && (
            <div className="space-y-[1vh]">
              {institutions.length > 0 ? (
                institutions.map((institution) => (
                  <InstitutionCard key={institution.id} institution={institution} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '5vh 0' }}>
                  <p style={{ fontSize: '3.5vw', color: '#999999' }}>暂无机构数据</p>
                </div>
              )}
            </div>
          )}

          {/* 底部间距 */}
          <div className="h-[5vh]"></div>
        </div>
      )}

      {/* 金融超市内容 */}
      {activeTab === 'supermarket' && (
        <div className="px-[4vw]">
          {/* 产品标签 */}
          {allTags.length > 0 && (
          <div
            className="flex gap-[2vw] mb-[2vh]"
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              whiteSpace: 'nowrap',
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <button
              onClick={() => setSelectedTag('all')}
              style={{
                padding: '0.5vh 2vw',
                fontSize: '3vw',
                backgroundColor: '#ffffff',
                color: selectedTag === 'all' ? '#0283EB' : '#333333',
                border: '1px solid ' + (selectedTag === 'all' ? '#0283EB' : '#CCCCCC'),
                borderRadius: '8px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '0.5vh 2vw',
                  fontSize: '3vw',
                  backgroundColor: '#ffffff',
                  color: selectedTag === tag ? '#0283EB' : '#333333',
                  border: '1px solid ' + (selectedTag === tag ? '#0283EB' : '#CCCCCC'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
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
                  <ProductCard key={product.id} product={product} />
                ))
            ) : (
              <div style={{ textAlign: 'center', padding: '5vh 0' }}>
                <p style={{ fontSize: '3.5vw', color: '#999999' }}>暂无产品数据</p>
              </div>
            )}
          </div>

          {/* 底部间距 */}
          <div className="h-[5vh]"></div>
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
