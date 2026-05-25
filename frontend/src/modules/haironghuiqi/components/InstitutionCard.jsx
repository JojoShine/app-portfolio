import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
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
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95"
      onClick={() => !showApplyButton && navigate(`/haironghuiqi/institution/${institution.id}`)}
    >
      {/* 卡片内容 */}
      <div className="flex items-start p-4 gap-4">
        {/* Logo */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {logoLoading ? (
            <div className="text-gray-400 text-xs">加载中...</div>
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={institution.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
        </div>

        {/* 机构信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {institution.name}
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} className="shrink-0" />
              <span className="text-sm">{institution.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock size={16} className="shrink-0" />
              <span className="text-sm">{institution.businessHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 申请按钮 */}
      {showApplyButton && (
        <div className="px-4 pb-4">
          <button
            className="w-full py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors active:scale-95"
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
