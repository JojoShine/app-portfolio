import React, { useState } from 'react';
import detailIcon from '../assets/institution_detail/detail.png';
import favoriteImage from '../assets/service_search/favorite.png';
import unfavoriteImage from '../assets/service_search/unfavorite.png';

/**
 * 产品卡片组件
 * 展示产品信息和操作按钮
 */
const ProductCard = ({ product }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      className="p-[3vw] bg-white"
      style={{
        background: 'linear-gradient(180deg, #E6ECF5 0%, #E6ECF5 4%, #FFFFFF 100%)',
        borderRadius: '8px',
      }}
    >
      {/* 产品名称和按钮 */}
      <div className="flex items-center justify-between mb-[1.5vh]">
        <h4 style={{ fontSize: '4vw', color: '#333333', margin: 0, flex: 1, fontWeight: 'bold' }}>
          {product.name}
        </h4>
        <div className="flex gap-[3vw]">
          {/* 详细说明按钮 */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
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

          {/* 收藏按钮 */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <img
              src={isFavorited ? favoriteImage : unfavoriteImage}
              alt={isFavorited ? '已收藏' : '未收藏'}
              style={{
                width: '5vw',
                height: '5vw',
                objectFit: 'contain',
              }}
            />
          </button>
        </div>
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
    </div>
  );
};

export default ProductCard;
