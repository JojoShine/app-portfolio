import { useCallback, useEffect, useId } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircleFill, LocationFill, CouponOutline } from 'antd-mobile-icons';
import { getPendingRequest } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import { useCountdown } from '../hooks/useCountdown';
import Artwork from '../components/Artwork';
import pendingReference from '../../../../../../docs/coupon/ui/08-pending-confirmation.png';
import CouponValue from '../components/CouponValue';
import DataState from '../components/DataState';
export default function PendingPage() {
  const artFilterId = useId();
  const { id } = useParams();
  const state = useCouponData(useCallback(() => getPendingRequest(id), [id]));
  const { reload } = state;
  const { label } = useCountdown(state.data?.expiresAt);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const timer = setInterval(() => { getPendingRequest(id).then((entry) => { if (!active) return; if (entry.status === 'confirmed') navigate(`/coupon/result/${entry.recordId}`, { replace: true }); else if (entry.status === 'expired') { clearInterval(timer); reload(); } }).catch(() => { if (active) { clearInterval(timer); reload(); } }); }, 2000);
    return () => { active = false; clearInterval(timer); };
  }, [id, navigate, reload]);
  const entry = state.data;
  return <div className="cv-pending"><header className="cv-pending-hero"><div className="cv-pending-hero-art" role="img" aria-label="盐城惠民消费季，等待商家确认，沙漏印章与湿地风景" style={{ backgroundImage: `url(${pendingReference})` }} /></header><DataState {...state} />{entry && <><div className="cv-pending-clock">{entry.status === 'expired' ? '已超时' : label}</div><p className="cv-pending-caption">{entry.status === 'expired' ? '消费券已解锁，可重新申请' : '申请将在5分钟后失效'}</p><div className="cv-page-padding"><div className="cv-pending-ticket-shadow"><section className="cv-pending-ticket"><div className="cv-pending-store"><Artwork name="store-round" /><div><h2>{entry.store.name}</h2><p><LocationFill /> {entry.store.address}</p></div></div><div className="cv-pending-voucher"><div><div className="cv-pending-coupon"><h2>{entry.coupon.name}</h2><CouponValue coupon={entry.coupon} /><Artwork name="select-ticket-reeds" /></div><p className="cv-request-number">申请单号：{entry.id}</p></div><aside className="cv-pending-voucher-art" aria-hidden="true"><svg width="0" height="0" style={{ position: 'absolute' }}><defs><filter id={artFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 18.9" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><span style={{ backgroundImage: `url(${pendingReference})`, filter: `url(#${artFilterId})` }} /></aside></div></section></div><div className="cv-progress"><div><CheckCircleFill /><span>已发起申请</span><small>{new Date(entry.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</small></div><div><b /><span>等待商家确认</span></div><div><b /><span>完成核销</span></div></div></div><Artwork name="pending-footer" className="cv-footer" /><p className="cv-pending-endline">— 盐城 让美好生活更近 —</p><Link className="cv-pending-wallet-button" to="/coupon/wallet"><CouponOutline aria-hidden="true" />返回我的卡包</Link></>}</div>;
}
