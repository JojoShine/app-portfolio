import PageHeader from '../components/PageHeader';
import { useCallback, useId, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarOutline, LocationFill, RightOutline, CouponOutline, BillOutline, ShopbagOutline } from 'antd-mobile-icons';
import { getActivity } from '../services/activity.service';
import { claimCoupon } from '../services/wallet.service';
import { useCouponData } from '../hooks/useCouponData';
import Artwork from '../components/Artwork';
import CouponValue from '../components/CouponValue';
import ClaimResult from '../components/ClaimResult';
import DataState from '../components/DataState';
export default function ActivityPage() {
  const { id } = useParams();
  const inkFilterId = useId();
  const state = useCouponData(useCallback(() => getActivity(id), [id]));
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const ticket = state.data?.tickets.find((item) => item.id === selected) || state.data?.tickets[0];
  async function claim() {
    if (busy || !ticket) return;
    setBusy(true);
    try { setResult({ coupon: await claimCoupon(ticket.id) }); }
    catch (error) { setResult({ title: '暂时无法领取', message: error.message }); }
    finally { setBusy(false); }
  }
  return <div className="cv-activity-page"><PageHeader /><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={inkFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 19.2" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><DataState {...state} />{state.data && <><div className="cv-page-padding"><section className="cv-activity-hero"><h1>{id === 'dining' ? <>建湖金秋<br />餐饮消费券</> : state.data.name}</h1><p>{id === 'dining' ? '寻味建湖 · 金秋有味 · 惠享美好' : state.data.subtitle}</p><div className="cv-activity-hero-badges"><span><LocationFill />{state.data.region}专区</span><span>演示项目</span></div></section><div className="cv-activity-description"><p>发放{state.data.name}，助力本地餐饮消费，让更多市民游客在建湖品味美食、乐享金秋。</p><aside>赏湿地风光<br />品建湖美味<small>TASTE<br />JIANHU</small></aside></div><p className="cv-activity-dates"><CalendarOutline /><time dateTime="2026-09-10T10:00:00+08:00">2026年09月10日 10:00</time><span aria-hidden="true">—</span><time dateTime="2026-10-31T23:59:00+08:00">2026年10月31日 23:59</time></p><section className="cv-paper-panel cv-batches"><header><h2><Artwork name="activity-batch-icon" style={{ filter: `url(#${inkFilterId})` }} />发放批次</h2><span>四时风物 · 美味建湖</span></header>{(state.data.batchRows || []).map((batch) => <div className="cv-batch" key={batch.name}><i /><strong>{batch.name}</strong><span>{batch.date}</span><b className={batch.stock === '已抢光' ? 'is-muted' : batch.stock === '库存紧张' ? 'is-limited' : ''}>{batch.stock}</b><RightOutline /></div>)}</section><section className="cv-paper-panel cv-ticket-choices"><header><h2><Artwork name="icon-dining" />消费券选择</h2><span>美食相伴 · 幸福加倍</span></header><div>{state.data.tickets.slice(0, 2).map((item) => <button key={item.id} className={ticket?.id === item.id ? 'is-selected' : ''} aria-pressed={ticket?.id === item.id} onClick={() => setSelected(item.id)}><CouponValue coupon={item} /><p>{item.name || state.data.name}</p></button>)}</div></section><nav className="cv-link-rows"><Link to="/coupon/rules"><BillOutline /><strong>活动规则</strong><small>领取条件、使用范围、有效期等</small><RightOutline /></Link><Link to="/coupon/merchants"><ShopbagOutline /><strong>适用商户</strong><small>查看建湖县餐饮商户名单</small><RightOutline /></Link></nav><button className="cv-primary cv-claim-button" disabled={busy || state.data.status !== 'active'} onClick={claim}><CouponOutline />{busy ? '领取中…' : state.data.status === 'active' ? '立即领取' : '尚未开始'}</button></div><div className="cv-footer cv-activity-footer"><Artwork name="activity-footer" style={{ filter: `url(#${inkFilterId})` }} /></div></>}{result && <ClaimResult result={result} onClose={() => setResult(null)} />}</div>;
}
