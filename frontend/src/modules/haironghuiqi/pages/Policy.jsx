import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
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
    <div className="w-screen min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <main className="px-4 pt-6 pb-6 max-w-2xl mx-auto w-full">
        {/* 搜索部分 */}
        <section className="mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索政策..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl focus:border-blue-900 focus:ring-0 outline-none transition-all text-gray-800 placeholder:text-gray-400"
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
