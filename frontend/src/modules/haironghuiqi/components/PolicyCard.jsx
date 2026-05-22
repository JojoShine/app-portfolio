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
    <div
      className="flex gap-[3vw] p-[3vw] bg-white"
      style={{
        borderRadius: '8px',
      }}
    >
      {/* Logo */}
      <div
        className="flex-shrink-0 bg-blue-500 flex items-center justify-center"
        style={{
          width: '24vw',
          height: '16vw',
          borderRadius: '4px',
        }}
      >
        {logoLoading ? (
          <div style={{ color: '#ffffff', fontSize: '3vw' }}>加载中...</div>
        ) : (
          <img
            src={logoUrl}
            alt={policy.title}
            className="w-full h-full object-cover"
            style={{
              borderRadius: '4px',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
            {policy.title}
          </h3>
          <p
            style={{
              fontSize: '3vw',
              color: '#999999',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {policy.description}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '2.8vw', color: '#999999', margin: 0 }}>
            发布时间：{formatDate(policy.publishedAt || policy.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
