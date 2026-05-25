import React from 'react';
import { NoticeBar } from 'antd-mobile';

/**
 * 统一的通知组件
 * 确保成功和错误提示的样式一致
 */
const Notification = ({ show, message, type = 'success' }) => {
  if (!show) return null;

  return (
    <NoticeBar
      content={message}
      color={type === 'success' ? 'success' : 'error'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
      }}
    />
  );
};

export default Notification;
