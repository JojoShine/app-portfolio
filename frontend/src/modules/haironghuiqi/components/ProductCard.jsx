import React from 'react';
import { useNavigate } from 'react-router-dom';
import detailIcon from '../assets/institution_detail/detail.png';

/**
 * 产品卡片组件
 * 展示产品信息和操作按钮
 */
const ProductCard = ({ product, showApplyButton = false, onApply = null }) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-[3vw] bg-white cursor-pointer border border-gray-200 rounded-lg"
      style={{
        borderRadius: '8px',
      }}
      onClick={() => !showApplyButton && navigate(`/haironghuiqi/product/${product.id}`)}
    >
      {/* 产品名称和icon */}
      <div className="flex items-center justify-between mb-[1.5vh]">
        <h4 style={{ fontSize: '4vw', color: '#333333', margin: 0, flex: 1, fontWeight: 'bold' }}>
          {product.name}
        </h4>
        {!showApplyButton && (
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginLeft: '1vw',
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/haironghuiqi/product/${product.id}`);
            }}
          >
            <img
              src={detailIcon}
              alt="详细说明"
              style={{
                width: '5vw',
                height: '5vw',
                objectFit: 'contain',
              }}
            />
          </button>
        )}
      </div>

      {/* 产品信息 */}
      <div className="flex gap-[2vw]">
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '4vw', color: '#0283EB', margin: 0, marginBottom: '0.5vh', fontWeight: 'bold' }}>
            {product.maxLoanAmount ? `${product.maxLoanAmount}万元` : '暂无'}
          </p>
          <p style={{ fontSize: '3vw', color: '#515151', margin: 0 }}>
            最高贷款额度
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '4vw', color: '#0283EB', margin: 0, marginBottom: '0.5vh', fontWeight: 'bold' }}>
            {product.maxLoanTerm ? `${product.maxLoanTerm}年` : '暂无'}
          </p>
          <p style={{ fontSize: '3vw', color: '#515151', margin: 0 }}>
            最长贷款期限
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '4vw', color: '#0283EB', margin: 0, marginBottom: '0.5vh', fontWeight: 'bold' }}>
            {product.minAnnualRate ? `${product.minAnnualRate}%` : '暂无'}
          </p>
          <p style={{ fontSize: '3vw', color: '#515151', margin: 0 }}>
            最低年化率
          </p>
        </div>
      </div>

      {/* 申请按钮 - 单独一行，居右 */}
      {showApplyButton && (
        <div className="flex gap-[2vw] justify-end" style={{ marginTop: '1.5vh', paddingTop: '1.5vh', borderTop: '1px solid #E0E0E0' }}>
          <button
            style={{
              padding: '0.6vh 2vw',
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

export default ProductCard;
