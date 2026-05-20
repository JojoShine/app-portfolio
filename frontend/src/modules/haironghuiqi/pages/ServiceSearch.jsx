import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Heart } from 'lucide-react';
import policyImage from '../assets/service_search/policy.png';
import haironghuiqiService from '../services/haironghuiqiService';

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

  const categories = [
    { id: 'all', name: '全部分类' },
    { id: 'bank', name: '银行' },
    { id: 'insurance', name: '保险' },
    { id: 'securities', name: '证券' },
  ];

  // 获取机构列表
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;
        if (searchQuery) {
          data = await haironghuiqiService.searchInstitutions(searchQuery, selectedCategory);
        } else if (selectedCategory && selectedCategory !== 'all') {
          data = await haironghuiqiService.getInstitutionsByCategory(selectedCategory);
        } else {
          data = await haironghuiqiService.getAllInstitutions();
        }
        setInstitutions(data);
      } catch (err) {
        console.error('获取机构列表失败:', err);
        setError('获取机构列表失败');
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
    <div className="service-search w-screen min-h-screen bg-white overflow-y-auto" style={{ paddingTop: '8vh' }}>
      {/* 最新政策卡片 */}
      <div className="px-[4vw] pt-[2vh]">
        <img
          src={policyImage}
          alt="最新政策"
          className="w-full h-auto object-cover rounded-lg"
          style={{
            maxHeight: '20vh',
          }}
        />
      </div>

      {/* Tab 切换 */}
      <div className="flex mt-[3vh] border-b border-gray-200">
        <button
          onClick={() => setActiveTab('institution')}
          className="flex-1 py-[2vh] text-center font-medium transition-colors"
          style={{
            color: activeTab === 'institution' ? '#5F6469' : '#999999',
            borderBottom: activeTab === 'institution' ? '3px solid #5F6469' : 'none',
            fontSize: '3.5vw',
          }}
        >
          机构查询
        </button>
        <button
          onClick={() => setActiveTab('supermarket')}
          className="flex-1 py-[2vh] text-center font-medium transition-colors"
          style={{
            color: activeTab === 'supermarket' ? '#5F6469' : '#999999',
            borderBottom: activeTab === 'supermarket' ? '3px solid #5F6469' : 'none',
            fontSize: '3.5vw',
          }}
        >
          金融超市
        </button>
      </div>

      {/* 机构查询内容 */}
      {activeTab === 'institution' && (
        <div className="px-[4vw] py-[2vh]">
          {/* 搜索框 */}
          <div className="mb-[2vh]">
            <div className="flex items-center bg-gray-100 rounded-lg px-[3vw] py-[1.5vh] mb-[1vh]">
              <Search size={18} style={{ color: '#999999', marginRight: '1vw' }} />
              <input
                type="text"
                placeholder="搜索机构名称"
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: '3.5vw', color: '#000000' }}
              />
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="mb-[2vh] flex gap-[1vw] overflow-x-auto pb-[1vh]">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-[3vw] py-[1vh] rounded-full whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: selectedCategory === category.id ? '#5F6469' : '#f0f0f0',
                  color: selectedCategory === category.id ? '#ffffff' : '#5F6469',
                  fontSize: '3vw',
                }}
              >
                {category.name}
              </button>
            ))}
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
            <div className="space-y-[2vh]">
              {institutions.length > 0 ? (
                institutions.map((institution) => (
                  <div
                    key={institution.id}
                    className="flex gap-[3vw] p-[3vw] bg-white border border-gray-200 rounded-lg"
                  >
                    {/* Logo */}
                    <div
                      className="flex-shrink-0 bg-red-500 rounded-lg flex items-center justify-center"
                      style={{
                        width: '15vw',
                        height: '15vw',
                      }}
                    >
                      <img
                        src={institution.logo}
                        alt={institution.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium mb-[1vh]" style={{ fontSize: '4vw', color: '#000000' }}>
                          {institution.name}
                        </h3>
                        <div className="flex items-start gap-[1vw] mb-[1vh]">
                          <MapPin size={16} style={{ color: '#999999', marginTop: '0.5vh', flexShrink: 0 }} />
                          <p style={{ fontSize: '3vw', color: '#999999' }}>{institution.address}</p>
                        </div>
                        <div className="flex items-center gap-[1vw]">
                          <Clock size={16} style={{ color: '#999999' }} />
                          <p style={{ fontSize: '3vw', color: '#999999' }}>{institution.businessHours}</p>
                        </div>
                      </div>
                    </div>

                    {/* 收藏按钮 */}
                    <button
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: '6vw',
                        height: '6vw',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Heart
                        size={20}
                        style={{
                          color: '#999999',
                          fill: 'none',
                        }}
                      />
                    </button>
                  </div>
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
        <div className="px-[4vw] py-[2vh]">
          <p style={{ fontSize: '4vw', color: '#999999', textAlign: 'center', marginTop: '10vh' }}>
            金融超市功能开发中...
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
