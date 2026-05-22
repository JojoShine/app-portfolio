import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NoticeBar } from 'antd-mobile';
import haironghuiqiService from '../services/haironghuiqiService';
import ProductCard from '../components/ProductCard';
import InstitutionCard from '../components/InstitutionCard';
import ApplicationModal from '../components/ApplicationModal';

/**
 * 产品详情页面
 * 展示产品信息和可办理该产品的机构列表
 */
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationType, setApplicationType] = useState(null);
  const [noticeBar, setNoticeBar] = useState({ show: false, message: '', type: 'success' });

  const handleInstitutionApply = (type) => {
    setApplicationType(type);
    setIsModalOpen(true);
  };

  // 获取产品详情
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await haironghuiqiService.getProductDetail(id);
        setProduct(productData);

        // 获取该产品所属的机构信息
        if (productData.institutionId) {
          const institutionData = await haironghuiqiService.getInstitutionDetail(productData.institutionId);
          setInstitution(institutionData);
        }
      } catch (err) {
        console.error('获取产品详情失败:', err);
        setError(err.message || '获取产品详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
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

  if (error || !product) {
    return (
      <div className="w-screen min-h-screen overflow-y-auto" style={{ backgroundColor: '#EFF4F8' }}>
        <div style={{ textAlign: 'center', padding: '5vh 0' }}>
          <p style={{ fontSize: '3.5vw', color: '#ff0000' }}>{error || '产品不存在'}</p>
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

      {/* 产品卡片 */}
      <div className="px-[4vw] py-[2vh]">
        <ProductCard product={product} />
      </div>

      {/* 可办理该产品的机构 */}
      {institution && (
        <div className="px-[4vw]">
          <h4 style={{ fontSize: '3.5vw', color: '#333333', margin: 0, marginBottom: '1vh' }}>
            可办理机构
          </h4>
          <InstitutionCard institution={institution} showApplyButton={true} onApply={handleInstitutionApply} />
        </div>
      )}

      {/* 底部间距 */}
      <div className="h-[5vh]"></div>

      {/* 申请弹窗 */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
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

export default ProductDetail;