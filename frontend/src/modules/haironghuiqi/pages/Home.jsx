import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import bgImage from '../assets/bg.png';
import logoImage from '../assets/logo.png';
import product1 from '../assets/1.png';
import product2 from '../assets/2.png';
import product3 from '../assets/3.png';
import product4 from '../assets/4.png';
import product5 from '../assets/5.png';

/**
 * 海融惠企首页
 * 展示品牌和产品分类入口
 */
const HaironghuiqiHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);

  // 产品分类数据
  const products = [
    { id: 1, image: product1, title: '金融政策', subtitle: '金融政策惠民' },
    { id: 2, image: product2, title: '银行', subtitle: '便民金融相随' },
    { id: 3, image: product3, title: '保险', subtitle: '普惠万家安康' },
    { id: 4, image: product4, title: '证券', subtitle: '守护投资收益' },
    { id: 5, image: product5, title: '其他金融', subtitle: '安全融通无忧' },
  ];

  const handleProductClick = (productId) => {
    // TODO: 根据产品ID导航到相应的页面
    console.log('点击产品:', productId);
  };

  return (
    <div className="haironghuiqi-home w-screen h-screen overflow-hidden">
      {/* 背景 - fixed */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          zIndex: 0,
        }}
      />

      {/* Logo - fixed */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 flex justify-center"
        style={{
          top: '4vh',
          zIndex: 10,
        }}
      >
        <img
          src={logoImage}
          alt="海融惠企"
          className="h-[11.8vw] object-contain"
          style={{
            maxWidth: '90vw',
          }}
        />
      </div>

      {/* 产品分类网格 - fixed */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 overflow-y-auto"
        style={{
          top: '45vh',
          width: '100vw',
          height: 'calc(100vh - 45vh)',
          zIndex: 5,
        }}
      >
        <div className="w-full flex justify-center px-[4vw]">
          <div className="w-full max-w-[92vw]">
            <div className="grid grid-cols-2 gap-[5vw] gap-y-[4vw] pb-[2rem]">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 relative"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-auto object-cover"
                    style={{
                      aspectRatio: '408 / 201.6',
                    }}
                  />
                  <div
                    className="absolute inset-0 flex flex-col justify-start rounded-lg p-[3vw]"
                  >
                    <h3
                      className="font-medium"
                      style={{
                        fontSize: '4vw',
                        color: '#000000',
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {product.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '3vw',
                        color: '#685F60',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        marginTop: '0.5vw',
                      }}
                    >
                      {product.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 我的收藏浮动按钮 - fixed */}
      <button
        onClick={() => {
          // TODO: 导航到我的收藏页面
          navigate('/haironghuiqi/collections');
        }}
        className="fixed bg-white flex items-center justify-center gap-[2vw]"
        style={{
          bottom: '3vh',
          left: '50%',
          marginLeft: '-15vw',
          width: '30vw',
          height: '4vh',
          borderRadius: '50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 50,
        }}
      >
        <Heart size={20} style={{ width: '4vw', height: '4vw', color: '#5F6469' }} />
        <span style={{ fontSize: '3vw', color: '#5F6469', fontWeight: 400 }}>
          我的收藏
        </span>

        {/* 角标 */}
        {collectionCount > 0 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: '-1vh',
              right: '1vw',
              width: '4vh',
              height: '4vh',
              backgroundColor: '#FF4444',
              borderRadius: '50%',
              color: '#ffffff',
              fontSize: '2.5vh',
              fontWeight: 'bold',
            }}
          >
            {collectionCount}
          </div>
        )}
      </button>
    </div>
  );
};

export default HaironghuiqiHome;