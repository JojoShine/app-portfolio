import { useCallback, useId, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LocationFill, CouponOutline, DownOutline } from 'antd-mobile-icons';
import { listMerchants } from '../services/merchant.service';
import { listCoupons } from '../services/wallet.service';
import { createPendingRequest } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import Artwork from '../components/Artwork';
import selectReference from '../../../../../../docs/coupon/ui/07-select-coupon.png';
import CouponCard from '../components/CouponCard';
import Sheet from '../components/Sheet';
import DataState from '../components/DataState';
export default function SelectCouponPage() {
  const headingArtFilterId = useId();
  const { storeId } = useParams();
  const state = useCouponData(useCallback(async () => { const [stores, wallet] = await Promise.all([listMerchants(), listCoupons()]); const store = stores.find((item) => item.id === storeId); if (!store) throw new Error('门店不存在'); return { store, wallet }; }, [storeId]));
  const [selectedId, setSelectedId] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const usable = state.data?.wallet.filter((item) => item.status === 'available' && item.category === state.data.store.category && (item.region !== '建湖县' || item.region === state.data.store.region));
  const selected = usable?.find((item) => item.id === selectedId) || usable?.[0];
  async function apply() { setBusy(true); setError(''); try { const entry = await createPendingRequest(selected.id, storeId); navigate(`/coupon/pending/${entry.id}`); } catch (error) { setError(error.message); setConfirm(false); } finally { setBusy(false); } }
  return <div className="cv-select"><header className="cv-select-hero"><Artwork name="select-banner-complete" className="cv-select-banner" alt="湿地之城，幸福消费，盐城飞鹤与芦苇" /></header><DataState {...state} />{state.data && <div className="cv-page-padding"><section className="cv-selected-store"><Artwork name="store-round" /><Artwork name="select-store-art" className="cv-select-store-art" style={{ filter: `url(#${headingArtFilterId})` }} /><div><h2>{state.data.store.name}</h2><span className="cv-open-pill">营业中</span><p><LocationFill /> {state.data.store.address}</p></div></section><div className="cv-select-heading-row"><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={headingArtFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -2.5512 -8.5824 -.8664 0 11.16" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><h2 className="cv-select-heading">— 请选择本次核销使用的消费券</h2><span className="cv-select-heading-art" aria-hidden="true" style={{ backgroundImage: `url(${selectReference})`, filter: `url(#${headingArtFilterId})` }} /></div><div className="cv-select-list">{usable?.map((item) => <CouponCard key={item.id} coupon={item} variant="select" selected={selected?.id === item.id} onSelect={() => setSelectedId(item.id)} />)}</div><details className="cv-unavailable"><summary><span className="cv-unavailable-icon" aria-hidden="true" style={{ backgroundImage: `url(${selectReference})`, filter: `url(#${headingArtFilterId})` }} /><span>{state.data.wallet.length - (usable?.length || 0) ? '查看其他不可用券' : '暂无其他可用券'}</span><DownOutline /></summary>{state.data.wallet.filter((item) => !usable?.some((entry) => entry.id === item.id)).map((item) => <p key={item.id}><span className="cv-unavailable-name">{item.name}</span><span className="cv-unavailable-reason">{item.status !== 'available' ? '当前状态不可使用' : '当前门店不适用'}</span></p>)}</details>{error && <p role="alert" className="cv-error">{error}</p>}<button className="cv-primary cv-select-submit" disabled={!selected || busy} onClick={() => setConfirm(true)}><CouponOutline />申请核销</button></div>}<div className="cv-footer cv-select-footer" role="img" aria-label="在盐城，享美好；芦苇与湿地风景" style={{ backgroundImage: `url(${selectReference})` }} />{confirm && <Sheet title="确认申请核销" className="cv-select-confirm-sheet" onClose={() => setConfirm(false)}><div className="cv-select-confirm-info"><p>{state.data.store.name}</p><h3>{selected?.name}</h3></div><p className="cv-select-confirm-note">发起后消费券将锁定5分钟，等待商家确认；暂不支持主动取消。</p><button className="cv-primary" disabled={busy} onClick={apply}>{busy ? '申请中…' : '确认申请'}</button></Sheet>}</div>;
}
