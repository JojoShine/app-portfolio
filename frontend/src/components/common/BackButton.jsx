import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * 通用悬浮返回按钮
 * 用于H5测试，后续在载体中会由载体提供返回功能
 */
const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleBack}
      className="fixed bg-white flex items-center justify-center"
      style={{
        top: '2vh',
        left: '2vh',
        width: '5vh',
        height: '5vh',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 100,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <ArrowLeft size={24} style={{ color: '#5F6469' }} />
    </button>
  );
};

export default BackButton;