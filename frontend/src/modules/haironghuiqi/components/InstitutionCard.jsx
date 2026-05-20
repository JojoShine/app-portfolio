import React, { useState, useEffect } from 'react';
import { getFileUrl } from '../../../services/fileService';
import favoriteImage from '../assets/service_search/favorite.png';
import unfavoriteImage from '../assets/service_search/unfavorite.png';

/**
 * 机构卡片组件
 * 负责单个机构的展示和logo加载
 */
const InstitutionCard = ({ institution }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // 加载logo
  useEffect(() => {
    let isMounted = true;

    const loadLogo = async () => {
      try {
        setLogoLoading(true);
        if (institution.logo) {
          const url = await getFileUrl(institution.logo);
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
  }, [institution.logo]);

  return (
    <div
      className="flex gap-[3vw] p-[3vw] bg-white border border-gray-200 rounded-lg"
      style={{
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Logo */}
      <div
        className="flex-shrink-0 bg-red-500 flex items-center justify-center"
        style={{
          width: '13vw',
          height: '13vw',
          borderRadius: '4px',
        }}
      >
        {logoLoading ? (
          <div style={{ color: '#ffffff', fontSize: '3vw' }}>加载中...</div>
        ) : (
          <img
            src={logoUrl}
            alt={institution.name}
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
          <h3 className="font-medium mb-[1vh]" style={{ fontSize: '4vw', color: '#000000' }}>
            {institution.name}
          </h3>
          <div className="mb-[1vh]">
            <p style={{ fontSize: '3vw', color: '#000000' }}>地址：{institution.address}</p>
          </div>
          <div>
            <p style={{ fontSize: '3vw', color: '#000000' }}>营业时间：{institution.businessHours}</p>
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
        onClick={() => setIsFavorited(!isFavorited)}
      >
        <img
          src={isFavorited ? favoriteImage : unfavoriteImage}
          alt={isFavorited ? '已收藏' : '未收藏'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </button>
    </div>
  );
};

export default InstitutionCard;
