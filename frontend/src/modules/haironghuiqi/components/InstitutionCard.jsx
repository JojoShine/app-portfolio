import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFileUrl } from '../../../services/fileService';

/**
 * 机构卡片组件
 * 负责单个机构的展示和logo加载
 */
const InstitutionCard = ({ institution, showApplyButton = false, onApply = null }) => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);

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
      className="p-[3vw] bg-white border border-gray-200 rounded-lg"
      style={{
        cursor: showApplyButton ? 'default' : 'pointer',
      }}
      onClick={() => !showApplyButton && navigate(`/haironghuiqi/institution/${institution.id}`)}
    >
      {/* 卡片内容 */}
      <div className="flex gap-[3vw]">
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

        {/* 机构信息 */}
        <div className="flex-1">
          <h3 className="font-medium" style={{ fontSize: '4vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
            {institution.name}
          </h3>
          <div className="mb-[1vh]">
            <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>地址：{institution.address}</p>
          </div>
          <div>
            <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>营业时间：{institution.businessHours}</p>
          </div>
        </div>
      </div>

      {/* 申请按钮 - 单独一行，居右 */}
      {showApplyButton && (
        <div className="flex gap-[2vw] justify-end" style={{ marginTop: '1.5vh', paddingTop: '1.5vh', borderTop: '1px solid #E0E0E0' }}>
          <button
            style={{
              padding: '0.4vh 2vw',
              fontSize: '2.8vw',
              backgroundColor: '#0283EB',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onApply && onApply('apply');
            }}
          >
            立即申请
          </button>
          <button
            style={{
              padding: '0.4vh 2vw',
              fontSize: '2.8vw',
              backgroundColor: '#ffffff',
              color: '#0283EB',
              border: '1px solid #0283EB',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onApply && onApply('consult');
            }}
          >
            预约咨询
          </button>
        </div>
      )}
    </div>
  );
};

export default InstitutionCard;
