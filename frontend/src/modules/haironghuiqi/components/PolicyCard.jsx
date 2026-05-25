import React, { useState, useEffect } from 'react';
import { getFileUrl } from '../../../services/fileService';

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
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95">
      {/* Logo */}
      <div className="w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {logoLoading ? (
          <div className="text-gray-400 text-xs">加载中...</div>
        ) : logoUrl ? (
          <img
            src={logoUrl}
            alt={policy.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {policy.title}
          </h3>
          <p className="text-gray-600 line-clamp-3 mt-2" style={{ fontSize: '13px' }}>
            {policy.content || policy.description}
          </p>
          {policy.description && policy.content && (
            <p className="text-gray-500 line-clamp-2 mt-1" style={{ fontSize: '12px' }}>
              {policy.description}
            </p>
          )}
        </div>
        <div>
          <p className="text-gray-500 mt-2" style={{ fontSize: '12px' }}>
            发布时间：{formatDate(policy.publishedAt || policy.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
