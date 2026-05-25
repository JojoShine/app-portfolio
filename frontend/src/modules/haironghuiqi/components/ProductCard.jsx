import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Shield } from 'lucide-react';

/**
 * 产品卡片组件
 * 展示产品信息和操作按钮
 */
const ProductCard = ({ product, showApplyButton = false, onApply = null }) => {
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
