import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Building2 } from 'lucide-react';
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
      className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-300 group hover:-translate-y-0.5"
      onClick={() => !showApplyButton && navigate(`/haironghuiqi/institution/${institution.id}`)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.9) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(200,215,240,0.5)',
        boxShadow: '0 4px 20px rgba(30,58,138,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* 右下角机构 icon 叠层水印 */}
      <div className="absolute -right-3 -bottom-3 pointer-events-none" style={{ opacity: 0.05 }}>
        <Building2 size={80} className="text-blue-900" strokeWidth={1} />
      </div>

      {/* 卡片内容 */}
      <div className="relative flex items-start p-4 gap-4">
        {/* Logo */}
        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
          {logoLoading ? (
            <div className="text-blue-300 text-xs">...</div>
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={institution.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="text-blue-400 text-lg font-bold">{institution.name?.charAt(0)}</div>
          )}
        </div>

        {/* 机构信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-blue-800 transition-colors">
              {institution.name}
            </h3>
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0 ml-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-blue-600">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin size={14} className="shrink-0 text-blue-400" />
              <span className="text-xs leading-tight">{institution.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={14} className="shrink-0 text-blue-400" />
              <span className="text-xs">{institution.businessHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 申请按钮 */}
      {showApplyButton && (
        <div className="px-5 pb-4">
          <button
            className="w-full py-3 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 shadow-sm"
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
