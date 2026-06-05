import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Shield, Award, X } from 'lucide-react';
import { Popup } from 'antd-mobile';
import featuredImage from '../assets/service_search/isFeatured.png';

/**
 * 产品卡片组件
 * 展示产品信息和操作按钮
 * 支持明星产品样式
 */
const ProductCard = ({ product, showApplyButton = false, onApply = null, isFeatured = false }) => {
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(false);

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
              <div>
                <h3 className="font-semibold text-white text-lg leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Award size={14} className="text-amber-400" />
                  <span className="bg-amber-400 text-blue-900 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                    明星产品
                  </span>
                </div>
              </div>
            </div>
            {!showApplyButton && (
              <button
                className="text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1 text-xs font-semibold ml-2 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetail(true);
                }}
              >
                产品介绍
                <ExternalLink size={14} />
              </button>
            )}
          </div>

          {/* 描述 */}
          <p className="text-sm text-white/80 mb-4 line-clamp-2">
            {product.description || '专业的金融产品，为您提供最佳的投资方案。'}
          </p>

          {/* 属性标签 */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/60 mb-0.5">最高额度</p>
              <p className="font-bold text-amber-400 text-sm">
                {product.maxLoanAmount ? `${product.maxLoanAmount}万` : '-'}
              </p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/60 mb-0.5">期限</p>
              <p className="font-bold text-amber-400 text-sm">
                {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '-'}
              </p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/60 mb-0.5">年化率</p>
              <p className="font-bold text-amber-400 text-sm">
                {product.minAnnualRate ? `${product.minAnnualRate}%` : '-'}
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

        {/* 产品详情弹窗 */}
        <Popup
          visible={showDetail}
          onMaskClick={() => setShowDetail(false)}
          position="bottom"
          bodyStyle={{
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            minHeight: '60vh',
            maxHeight: '80vh',
          }}
        >
          <div className="relative">
            {/* 关闭按钮 */}
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
              onClick={() => setShowDetail(false)}
            >
              <X size={18} className="text-gray-600" />
            </button>

            {/* 弹窗内容 */}
            <div className="p-6 pt-8">
              {/* 标题区域 */}
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isFeatured ? 'bg-amber-400' : 'bg-gradient-to-br from-blue-50 to-blue-100'
                }`}>
                  <Shield size={28} className={isFeatured ? 'text-blue-900' : 'text-blue-700'} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold flex items-center gap-1.5 ${
                    isFeatured ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {product.name}
                    {isFeatured && <Award size={18} className="text-amber-400" />}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    isFeatured ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {product.Institution?.name || '金融机构'}
                  </p>
                </div>
              </div>

              {/* 产品描述 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">产品说明</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description || '专业的金融产品，为您提供最佳的投资方案。'}
                </p>
              </div>

              {/* 产品要素 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">产品要素</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-3 text-center ${
                    isFeatured ? 'bg-blue-50' : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
                  }`}>
                    <p className="text-[10px] text-gray-400 mb-1">最高额度</p>
                    <p className="font-bold text-blue-800 text-sm">
                      {product.maxLoanAmount ? `${product.maxLoanAmount}万` : '-'}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${
                    isFeatured ? 'bg-indigo-50' : 'bg-gradient-to-br from-indigo-50 to-indigo-100/50'
                  }`}>
                    <p className="text-[10px] text-gray-400 mb-1">期限</p>
                    <p className="font-bold text-indigo-800 text-sm">
                      {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '-'}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${
                    isFeatured ? 'bg-amber-50' : 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                  }`}>
                    <p className="text-[10px] text-gray-400 mb-1">年化率</p>
                    <p className="font-bold text-amber-700 text-sm">
                      {product.minAnnualRate ? `${product.minAnnualRate}%` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 其他信息 */}
              {(product.features || product.requirements) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">详细信息</h4>
                  <div className="space-y-2">
                    {product.features && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">产品特点</p>
                        <p className="text-sm text-gray-600">{product.features}</p>
                      </div>
                    )}
                    {product.requirements && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">申请条件</p>
                        <p className="text-sm text-gray-600">{product.requirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              {showApplyButton && (
                <button
                  className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors active:scale-95"
                  onClick={() => {
                    setShowDetail(false);
                    onApply && onApply('consult');
                  }}
                >
                  预约咨询
                </button>
              )}
            </div>
          </div>
        </Popup>
      </div>
    );
  }

  // 普通产品样式
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-300 group hover:-translate-y-0.5"
      onClick={() => !showApplyButton && navigate(`/haironghuiqi/product/${product.id}`)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.9) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(200,215,240,0.5)',
        boxShadow: '0 4px 20px rgba(30,58,138,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* 卡片内容 */}
      <div className="p-5 pt-6">
        {/* 标题和详情链接 */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
              <Shield size={22} className="text-blue-700" />
            </div>
            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-blue-800 transition-colors flex items-center gap-1.5">
              {product.name}
              {isFeatured && (
                <Award size={16} className="text-amber-400" />
              )}
            </h3>
          </div>
          {!showApplyButton && (
            <button
              className="text-blue-600 hover:text-blue-800 transition-all flex items-center gap-1 text-xs font-semibold shrink-0 ml-2 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
            >
              产品介绍
              <ExternalLink size={12} />
            </button>
          )}
        </div>

        {/* 描述 */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {product.description || '专业的金融产品，为您提供最佳的投资方案。'}
        </p>

        {/* 属性标签 */}
        <div className="flex gap-2">
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">最高额度</p>
            <p className="font-bold text-blue-800 text-sm">
              {product.maxLoanAmount ? `${product.maxLoanAmount}万` : '-'}
            </p>
          </div>
          <div className="flex-1 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">期限</p>
            <p className="font-bold text-indigo-800 text-sm">
              {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '-'}
            </p>
          </div>
          <div className="flex-1 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">年化率</p>
            <p className="font-bold text-amber-700 text-sm">
              {product.minAnnualRate ? `${product.minAnnualRate}%` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 申请按钮 */}
      {showApplyButton && (
        <div className="px-5 pb-5">
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

      {/* 产品详情弹窗 */}
      <Popup
        visible={showDetail}
        onMaskClick={() => setShowDetail(false)}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          minHeight: '60vh',
          maxHeight: '80vh',
        }}
      >
        <div className="relative">
          {/* 关闭按钮 */}
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
            onClick={() => setShowDetail(false)}
          >
            <X size={18} className="text-gray-600" />
          </button>

          {/* 弹窗内容 */}
          <div className="p-6 pt-8">
            {/* 标题区域 */}
            <div className="flex items-start gap-3 mb-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isFeatured ? 'bg-amber-400' : 'bg-gradient-to-br from-blue-50 to-blue-100'
              }`}>
                <Shield size={28} className={isFeatured ? 'text-blue-900' : 'text-blue-700'} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold flex items-center gap-1.5 ${
                  isFeatured ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {product.name}
                  {isFeatured && <Award size={18} className="text-amber-400" />}
                </h3>
                <p className={`text-xs mt-1 ${
                  isFeatured ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {product.Institution?.name || '金融机构'}
                </p>
              </div>
            </div>

            {/* 产品描述 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">产品说明</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || '专业的金融产品，为您提供最佳的投资方案。'}
              </p>
            </div>

            {/* 产品要素 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">产品要素</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl p-3 text-center ${
                  isFeatured ? 'bg-blue-50' : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
                }`}>
                  <p className="text-[10px] text-gray-400 mb-1">最高额度</p>
                  <p className="font-bold text-blue-800 text-sm">
                    {product.maxLoanAmount ? `${product.maxLoanAmount}万` : '-'}
                  </p>
                </div>
                <div className={`rounded-xl p-3 text-center ${
                  isFeatured ? 'bg-indigo-50' : 'bg-gradient-to-br from-indigo-50 to-indigo-100/50'
                }`}>
                  <p className="text-[10px] text-gray-400 mb-1">期限</p>
                  <p className="font-bold text-indigo-800 text-sm">
                    {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '-'}
                  </p>
                </div>
                <div className={`rounded-xl p-3 text-center ${
                  isFeatured ? 'bg-amber-50' : 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                }`}>
                  <p className="text-[10px] text-gray-400 mb-1">年化率</p>
                  <p className="font-bold text-amber-700 text-sm">
                    {product.minAnnualRate ? `${product.minAnnualRate}%` : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* 其他信息 */}
            {(product.features || product.requirements) && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">详细信息</h4>
                <div className="space-y-2">
                  {product.features && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">产品特点</p>
                      <p className="text-sm text-gray-600">{product.features}</p>
                    </div>
                  )}
                  {product.requirements && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">申请条件</p>
                      <p className="text-sm text-gray-600">{product.requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            {showApplyButton && (
              <button
                className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors active:scale-95"
                onClick={() => {
                  setShowDetail(false);
                  onApply && onApply('consult');
                }}
              >
                预约咨询
              </button>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default ProductCard;
