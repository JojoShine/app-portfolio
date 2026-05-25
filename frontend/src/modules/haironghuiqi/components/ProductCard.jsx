import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Shield } from 'lucide-react';
import featuredImage from '../assets/service_search/isFeatured.png';

/**
 * 产品卡片组件
 * 展示产品信息和操作按钮
 * 支持明星产品样式
 */
const ProductCard = ({ product, showApplyButton = false, onApply = null, isFeatured = false }) => {
  const navigate = useNavigate();

  // 获取产品图标颜色
  const getIconColor = (index) => {
    const colors = ['bg-blue-100', 'bg-purple-100', 'bg-teal-100', 'bg-amber-100', 'bg-pink-100', 'bg-green-100'];
    // 确保index是一个有效的数字
    const numIndex = typeof index === 'number' ? index : 0;
    return colors[Math.abs(numIndex) % colors.length];
  };

  // 获取产品icon
  const getProductIcon = (name) => {
    return Shield;
  };

  const IconComponent = getProductIcon(product.name);

  // 明星产品样式
  if (isFeatured) {
    return (
      <div
        className="relative rounded-xl border border-blue-800 overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-all group"
        onClick={() => !showApplyButton && navigate(`/haironghuiqi/product/${product.id}`)}
      >
        {/* 背景图片 */}
        <>
          <img
            src={featuredImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-blue-900/20"></div>
        </>

        {/* 卡片内容 */}
        <div className="relative z-10 p-6 pb-4">
          {/* 标题和详情链接 */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-400 flex items-center justify-center text-blue-900 shadow-lg">
                <Shield size={24} />
              </div>
              <h3 className="font-semibold text-white text-lg leading-tight flex-1">
                {product.name}
              </h3>
            </div>
            {!showApplyButton && (
              <button
                className="text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1 text-xs font-semibold ml-2 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/haironghuiqi/product/${product.id}`);
                }}
              >
                详情
                <ExternalLink size={14} />
              </button>
            )}
          </div>

          {/* 描述 */}
          <p className="text-sm text-white/80 mb-4 line-clamp-2">
            {product.description || '专业的金融产品，为您提供最佳的投资方案。'}
          </p>

          {/* 属性网格 */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-white/10 py-4">
            <div>
              <p className="text-xs text-white/60 mb-1">最高额度</p>
              <p className="font-semibold text-amber-400 text-sm">
                {product.maxLoanAmount ? `${product.maxLoanAmount}万` : '暂无'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">期限</p>
              <p className="font-semibold text-amber-400 text-sm">
                {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '暂无'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">年化率</p>
              <p className="font-semibold text-amber-400 text-sm">
                {product.minAnnualRate ? `${product.minAnnualRate}%` : '暂无'}
              </p>
            </div>
          </div>
        </div>

        {/* 申请按钮 */}
        {showApplyButton && (
          <div className="relative z-10 px-6 pb-6 bg-blue-900/50">
            <button
              className="w-full py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors active:scale-95"
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
  }

  // 普通产品样式
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95"
      onClick={() => !showApplyButton && navigate(`/haironghuiqi/product/${product.id}`)}
    >
      {/* 卡片内容 */}
      <div className="p-6 pb-4">
        {/* 标题和详情链接 */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${getIconColor(product.id)} flex items-center justify-center`}>
              <IconComponent size={24} className="text-blue-900" />
            </div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {product.name}
            </h3>
          </div>
          {!showApplyButton && (
            <button
              className="text-blue-900 hover:underline transition-all flex items-center gap-1 text-xs font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/haironghuiqi/product/${product.id}`);
              }}
            >
              详情
              <ExternalLink size={14} />
            </button>
          )}
        </div>

        {/* 描述 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description || '专业的金融产品，为您提供最佳的投资方案。'}
        </p>

        {/* 属性网格 */}
        <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-200 py-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">最高额度</p>
            <p className="font-semibold text-blue-900 text-sm">
              {product.maxLoanAmount ? `${product.maxLoanAmount}万` : '暂无'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">期限</p>
            <p className="font-semibold text-blue-900 text-sm">
              {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '暂无'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">年化率</p>
            <p className="font-semibold text-blue-900 text-sm">
              {product.minAnnualRate ? `${product.minAnnualRate}%` : '暂无'}
            </p>
          </div>
        </div>
      </div>

      {/* 申请按钮 */}
      {showApplyButton && (
        <div className="px-6 pb-6">
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

export default ProductCard;
