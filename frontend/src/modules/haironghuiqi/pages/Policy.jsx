import React, { useState, useEffect } from 'react';
import bannerImage from '../assets/policy/banner.png';
import searchIcon from '../assets/policy/search_icon.png';
import haironghuiqiService from '../services/haironghuiqiService';
import PolicyCard from '../components/PolicyCard';

/**
 * 金融政策页面
 * 展示金融政策列表
 */
const Policy = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取政策列表
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        const policyList = await haironghuiqiService.getPolicyList();
        setPolicies(policyList);
      } catch (err) {
        console.error('获取政策列表失败:', err);
        setError(err.message || '获取政策列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // 过滤政策列表
  const filteredPolicies = policies.filter((policy) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      policy.title.toLowerCase().includes(query) ||
      (policy.description && policy.description.toLowerCase().includes(query))
    );
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8' }}>
      {/* Banner */}
      <div className="px-[4vw] py-[2vh]">
        <img
          src={bannerImage}
          alt="金融政策"
          className="w-full h-auto object-cover rounded-lg"
          style={{
            maxHeight: '25vh',
          }}
        />
      </div>

      {/* 搜索框 */}
      <div className="px-[4vw]">
        <div
          className="flex items-center bg-white rounded-lg px-[3vw] py-[1.5vh]"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <img
            src={searchIcon}
            alt="搜索"
            style={{
              width: '4vw',
              height: '4vw',
              marginRight: '1vw',
            }}
          />
          <input
            type="text"
            placeholder="搜索政策"
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: '3.5vw',
              color: '#333333',
            }}
          />
        </div>
      </div>

      {/* 政策卡片列表 */}
      <div className="px-[4vw] py-[2vh]">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5vh 0' }}>
            <p style={{ fontSize: '3.5vw', color: '#999999' }}>加载中...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '5vh 0' }}>
            <p style={{ fontSize: '3.5vw', color: '#ff0000' }}>{error}</p>
          </div>
        ) : filteredPolicies.length > 0 ? (
          <div className="space-y-[1vh]">
            {filteredPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5vh 0' }}>
            <p style={{ fontSize: '3.5vw', color: '#999999' }}>暂无政策数据</p>
          </div>
        )}
      </div>

      {/* 底部间距 */}
      <div className="h-[5vh]"></div>
    </div>
  );
};

export default Policy;
