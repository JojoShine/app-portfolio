import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SoundOutline, SoundMuteOutline } from 'antd-mobile-icons';
import { listPendingRequests } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import Artwork from '../components/Artwork';
import PendingRequestCard from '../components/PendingRequestCard';
import DataState from '../components/DataState';
export default function PendingListPage() {
  const storeId = sessionStorage.getItem('coupon-store') || 'store-1';
  const state = useCouponData(useCallback(() => listPendingRequests(storeId), [storeId]));
  const [sound, setSound] = useState(true);
  useEffect(() => { const timer = setInterval(state.reload, 10000); return () => clearInterval(timer); }, [state.reload]);
  return <div className="cv-pending-list"><div className="cv-pending-list-hero"><Artwork name="pending-list-banner" alt="盐城惠民消费季，滨海湿地，美好生活" /></div><div className="cv-page-padding"><header className="cv-pending-list-title"><Artwork name="pending-list-stamp" /><h1>待确认申请</h1><button onClick={() => setSound(!sound)}>{sound ? <SoundOutline /> : <SoundMuteOutline />}提示音已{sound ? '开启' : '关闭'}</button></header><DataState {...state} />{state.data?.map((entry) => <PendingRequestCard key={entry.id} request={entry} />)}{state.data?.length === 0 && <div className="cv-empty"><h2>暂无待确认申请</h2><p>用户扫描门店码后，申请会显示在这里。</p><Link className="cv-outline" to="/coupon/select/store-1">体验用户申请</Link></div>}<p className="cv-timeout-note">申请超时后将自动失效，消费券同步解锁</p></div><Artwork name="pending-list-footer" className="cv-footer" /></div>;
}
