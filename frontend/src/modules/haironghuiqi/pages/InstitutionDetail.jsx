import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NoticeBar } from 'antd-mobile';
import { getFileUrl } from '../../../services/fileService';
import haironghuiqiService from '../services/haironghuiqiService';
import ProductCard from '../components/ProductCard';
import ApplicationModal from '../components/ApplicationModal';

/**
 * 机构详情页面
 * 展示机构信息、介绍和产品列表
 */
const InstitutionDetail = () => {
  const { id } = useParams();
  const [institution, setInstitution] = useState(null);
  const [products, setProducts] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [applicationType, setApplicationType] = useState(null);
  const [noticeBar, setNoticeBar] = useState({ show: false, message: '', type: 'success' });

  const handleProductApply = (type, product) => {
    setSelectedProduct(product);
    setApplicationType(type);
    setIsModalOpen(true);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取机构详情
  useEffect(() => {
    const fetchInstitutionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const institutionData = await haironghuiqiService.getInstitutionDetail(id);
        setInstitution(institutionData);

        // 获取机构关联的产品列表
        const productList = await haironghuiqiService.getInstitutionProducts(id);
        setProducts(productList);

        // 加载logo
        if (institutionData.logo) {
          try {
            const url = await getFileUrl(institutionData.logo);
            setLogoUrl(url);
          } catch (err) {
            console.error('加载logo失败:', err);
          }
        }
      } catch (err) {
        console.error('获取机构详情失败:', err);
        setError(err.message || '获取机构详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInstitutionDetail();
    }

    // 清理blob URL
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8' }}>
        <div style={{ textAlign: 'center', padding: '5vh 0' }}>
          <p style={{ fontSize: '3.5vw', color: '#999999' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8' }}>
        <div style={{ textAlign: 'center', padding: '5vh 0' }}>
          <p style={{ fontSize: '3.5vw', color: '#ff0000' }}>{error || '机构不存在'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8' }}>
      {/* NoticeBar */}
      {noticeBar.show && (
        <NoticeBar
          content={noticeBar.message}
          color={noticeBar.type === 'success' ? 'success' : 'error'}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
          }}
        />
      )}

      {/* 机构信息卡片 */}
      <div className="px-[4vw] py-[2vh]">
        <div
          className="flex gap-[3vw] p-[3vw] bg-white"
          style={{
            borderRadius: '8px',
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
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={institution.name}
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '4px',
                }}
              />
            ) : (
              <div style={{ color: '#ffffff', fontSize: '3vw' }}>无logo</div>
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-medium mb-[1vh]" style={{ fontSize: '4vw', color: '#333333' }}>
                {institution.name}
              </h3>
              <div className="mb-[1vh]">
                <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                  地址：{institution.address}
                </p>
              </div>
              <div className="mb-[1vh]">
                <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                  营业时间：{institution.businessHours}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '3vw', color: '#333333', margin: 0 }}>
                  电话：{institution.phone || '暂无'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 介绍区域 */}
      {institution.description && (
        <div className="px-[4vw]">
          <div
            className="p-[3vw] bg-white"
            style={{
              borderRadius: '8px',
            }}
          >
            <h4 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
              机构介绍
            </h4>
            <p
              style={{
                fontSize: '3.5vw',
                color: '#333333',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {institution.description}
            </p>
          </div>
        </div>
      )}

      {/* 产品列表 */}
      {products.length > 0 && (
        <div className="px-[4vw] py-[2vh]">
          <h4 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
            产品列表
          </h4>
          <div className="space-y-[2vh]">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showApplyButton={true}
                onApply={(type) => handleProductApply(type, product)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 底部间距 */}
      <div className="h-[5vh]"></div>

      {/* 申请弹窗 */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        institution={institution}
        applicationType={applicationType}
        onSuccess={() => {
          setNoticeBar({ show: true, message: '加入资金方案成功', type: 'success' });
          setTimeout(() => setNoticeBar({ show: false, message: '', type: 'success' }), 3000);
        }}
        onError={(errorMessage) => {
          setNoticeBar({ show: true, message: errorMessage, type: 'fail' });
          setTimeout(() => setNoticeBar({ show: false, message: '', type: 'fail' }), 3000);
        }}
      />
    </div>
  );
};

export default InstitutionDetail;
