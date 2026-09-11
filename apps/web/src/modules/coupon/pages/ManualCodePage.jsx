import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextDeletionOutline } from 'antd-mobile-icons';
import { previewVerification } from '../services/verification.service';
import PageHeader from '../components/PageHeader';
import Artwork from '../components/Artwork';
import manualReference from '../../../../../../docs/coupon/ui/12-manual-code.png';
export default function ManualCodePage() {
  const artFilterId = useId();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const storeId = sessionStorage.getItem('coupon-store') || 'store-1';
  async function submit(event) {
    event?.preventDefault(); if (code.length !== 8 || busy) return;
    setBusy(true); setError('');
    try { await previewVerification(code, storeId); navigate(`/coupon/merchant/confirm?code=${code}&store=${encodeURIComponent(storeId)}`); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <div className="cv-manual" style={{ '--cv-manual-reference': `url(${manualReference})`, '--cv-manual-art-filter': `url(#${artFilterId})` }}><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={artFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 18.9" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><PageHeader title="手输核销码" back="/coupon/merchant" /><Artwork name="manual-banner" className="cv-manual-banner" /><div className="cv-page-padding"><form onSubmit={submit}><div className="cv-manual-ticket-shadow"><section className="cv-manual-ticket"><h2>请输入用户出示的8位动态核销码</h2><label className="cv-code-field"><input aria-label="8位动态核销码" inputMode="none" autoComplete="off" value={code} maxLength={8} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} /><span aria-hidden="true" className="cv-code-boxes">{Array.from({ length: 8 }, (_, index) => <b className={index === code.length ? 'is-current' : ''} key={index}>{code[index] || ''}</b>)}</span></label><p>核销码每60秒刷新，请及时确认</p><Artwork name="manual-ticket-art" /></section></div><div className="cv-keypad">{['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'clear'].map((key) => <button type="button" key={key} aria-label={key === 'delete' ? '删除一位' : key === 'clear' ? '清空券码' : key} onClick={() => setCode((value) => key === 'delete' ? value.slice(0, -1) : key === 'clear' ? '' : (value + key).slice(0, 8))}>{key === 'delete' ? <TextDeletionOutline /> : key === 'clear' ? '' : key}</button>)}</div>{error && <p role="alert" className="cv-error">{error}</p>}<button className="cv-primary cv-manual-submit" disabled={busy || code.length !== 8}>{busy ? '查询中…' : '查询消费券'}</button></form></div><Artwork name="manual-footer" className="cv-footer" /></div>;
}
