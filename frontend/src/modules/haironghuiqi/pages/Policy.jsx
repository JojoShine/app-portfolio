import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="w-screen min-h-screen" style={{ background: 'linear-gradient(180deg, #eef2f7 0%, #f8fafc 50%, #eef2f7 100%)' }}>
      {/* 顶部装饰背景 */}
      <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none" />

      {/* 主内容区域 */}
      <main className="relative px-4 pt-6 pb-6 max-w-2xl mx-auto w-full">
        {/* 页面标题 */}
        <section className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1">金融政策</h1>
          <p className="text-sm text-gray-500">了解最新金融政策动向，把握投资机遇</p>
        </section>

        {/* 搜索部分 */}
        <section className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索政策..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-12 px-4 rounded-xl focus:outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(200,215,240,0.5)',
                boxShadow: '0 2px 12px rgba(30,58,138,0.04)',
              }}
            />
          </div>
        </section>

        {/* 政策列表 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredPolicies.length > 0 ? (
          <div className="space-y-3">
            {filteredPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无政策数据</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Policy;
