import React, { useState, useEffect } from 'react';
import { getFileUrl } from '../../../services/fileService';
import { FileText, Calendar } from 'lucide-react';

/**
 * 政策卡片组件
 * 负责单个政策的展示和logo加载
 */
const PolicyCard = ({ policy }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // 加载logo
  useEffect(() => {
    let isMounted = true;

    const loadLogo = async () => {
      try {
        setLogoLoading(true);
        if (policy.logo) {
          const url = await getFileUrl(policy.logo);
          if (isMounted) {
            setLogoUrl(url);
          } else {
            // 如果组件已卸载，清理blob URL
            URL.revokeObjectURL(url);
          }
        }
      } catch (error) {
        console.error('加载logo失败:', error);
        if (isMounted) {
          setLogoUrl(null);
        }
      } finally {
        if (isMounted) {
          setLogoLoading(false);
        }
      }
    };

    loadLogo();

    // 清理函数
    return () => {
      isMounted = false;
      // 清理旧的blob URL
      setLogoUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [policy.logo]);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-300 group hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.9) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(200,215,240,0.5)',
        boxShadow: '0 4px 20px rgba(30,58,138,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* 右下角政策 icon 叠层水印 */}
      <div className="absolute -right-3 -bottom-3 pointer-events-none" style={{ opacity: 0.05 }}>
        <FileText size={80} className="text-blue-900" strokeWidth={1} />
      </div>

      {/* 左侧装饰条 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-blue-800 rounded-l-2xl" />

      <div className="flex items-start gap-4 p-4 pl-5">
        {/* Logo/图标区 */}
        <div className="w-24 h-18 shrink-0 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
          {logoLoading ? (
            <div className="text-blue-300 text-xs">...</div>
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={policy.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <FileText size={28} className="text-blue-300" />
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug group-hover:text-blue-800 transition-colors">
              {formatDate(policy.publishedAt || policy.createdAt)} {policy.title}
            </h3>
            <p className="text-gray-500 line-clamp-2 mt-1.5 text-[13px] leading-relaxed">
              {policy.content || policy.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
