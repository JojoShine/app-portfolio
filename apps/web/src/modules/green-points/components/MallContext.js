import { createContext, useContext } from 'react';
export const MallContext = createContext(null);
export const useMallContext = () => useContext(MallContext);
export const dateText = time => new Date(time).toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});
export const statuses = {
  pending: '待提货',
  shipping: '待收货',
  available: '待使用',
  completed: '已完成',
  cancelled: '已取消',
  expired: '已过期'
};
export const shortDate = time => new Date(time).toLocaleDateString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  month: 'numeric',
  day: 'numeric'
});
