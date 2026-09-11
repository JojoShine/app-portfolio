import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserOutline, CalendarOutline, ShopbagOutline, LocationOutline, AppstoreOutline, ExclamationCircleOutline } from 'antd-mobile-icons';
import { previewVerification, confirmVerification, getPendingRequest, confirmPendingRequest } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import PageHeader from '../components/PageHeader';
import Artwork from '../components/Artwork';
import CouponValue from '../components/CouponValue';
import DataState from '../components/DataState';
export default function VerificationConfirmPage() {
  const [params] = useSearchParams();
  const code = params.get('code') || '';
  const storeId = params.get('store') || 'store-1';
  const pending = params.get('pending');
  const state = useCouponData(useCallback(() => pending ? getPendingRequest(pending) : previewVerification(code, storeId), [code, storeId, pending]));
  const [requestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function confirm() {
    if (busy) return;
    setBusy(true); setError('');
    try { const record = pending ? await confirmPendingRequest(pending, requestId) : await confirmVerification(code, storeId, requestId); navigate(`/coupon/merchant/result/${record.id}`, { replace: true }); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  const data = state.data;
  const rows = data ? [[UserOutline, '用户', data.user || '李**'], [CalendarOutline, '有效期', data.coupon.validityLabel || new Date(data.coupon.expiresAt).toLocaleDateString('zh-CN')], [ShopbagOutline, '使用范围', data.coupon.scope || '建湖县指定餐饮门店'], [LocationOutline, '核销门店', data.store.name], [AppstoreOutline, '核销方式', pending ? '商家确认核销' : '动态核销码']] : [];
  return <div className="cv-confirm"><PageHeader title="确认核销" back="/coupon/merchant" /><Artwork name="confirm-banner" className="cv-confirm-banner" /><DataState {...state} />{data && <div className="cv-page-padding"><section className="cv-confirm-ticket"><div><Artwork name="confirm-ticket-bird" className="cv-confirm-ticket-bird" /><Artwork name="confirm-ticket-reeds" className="cv-confirm-ticket-reeds" /><h2>{data.coupon.name}</h2><CouponValue coupon={data.coupon} /><small>YANCHENG ─</small><p>寻味建湖 食在金秋</p></div><Artwork name="confirm-stamp" alt="当前门店可核销" /><p className="cv-confirm-stub-caption">湿地盐城<br />生态家园</p></section><dl className="cv-confirm-fields">{rows.map(([Icon, label, value]) => <div key={label}><dt><Icon />{label}</dt><dd>{value}</dd></div>)}</dl><div className="cv-confirm-warning"><ExclamationCircleOutline /><div><h3>确认后不可撤销，请核对信息</h3><p>请确认以上券信息与核销门店一致</p></div></div>{error && <p role="alert" className="cv-error">{error}</p>}<div className="cv-two-actions"><Link className="cv-outline" to="/coupon/merchant">返回</Link><button className="cv-primary" disabled={busy} onClick={confirm}>{busy ? '核销中…' : '确认核销'}</button></div></div>}<Artwork name="confirm-footer" className="cv-footer" /></div>;
}
