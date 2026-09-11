import PageHeader from '../components/PageHeader';
import { useCallback, useId } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClockCircleOutline, LocationFill, BillOutline } from 'antd-mobile-icons';
import { getCoupon } from '../services/wallet.service';
import { useCouponData } from '../hooks/useCouponData';
import { useCredential } from '../hooks/useCredential';
import { statusNames } from '../constants/options';
import Artwork from '../components/Artwork';
import CouponValue from '../components/CouponValue';
import CouponCredential from '../components/CouponCredential';
import DataState from '../components/DataState';
export default function CouponPage() {
  const { id } = useParams();
  const artFilterId = useId();
  const state = useCouponData(useCallback(() => getCoupon(id), [id]));
  const credential = useCredential(id, state.data?.status === 'available');
  return <div className="cv-detail"><PageHeader /><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={artFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 19.2" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><Artwork name="detail-banner" className="cv-detail-banner" alt="盐城，湿地之城，享美好生活" /><DataState {...state} />{state.data && <div className="cv-page-padding"><div className="cv-detail-ticket-shadow"><article className="cv-detail-ticket"><h2>{state.data.activityName || state.data.name}</h2><p className="cv-lettered">品 建 湖 美 食 享 人 间 烟 火</p><CouponValue coupon={state.data} /><span className={`cv-stamp ${state.data.status === 'available' ? 'cv-detail-stamp-art' : ''}`}>{state.data.status === 'available' ? <Artwork name="detail-available-stamp" alt="可使用" /> : statusNames[state.data.status]}</span><Artwork name="detail-ticket-art" style={{ filter: `url(#${artFilterId})` }} /><div className="cv-detail-meta"><p><ClockCircleOutline /><span>有效期</span>{state.data.validityLabel || new Date(state.data.expiresAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '.')}</p><p><LocationFill /><span>适用范围</span>{`${state.data.region}指定${state.data.category}门店`}</p></div></article></div>{state.data.status === 'available' ? <CouponCredential credential={credential} onOpen={credential.refresh} opened /> : <section className="cv-paper-panel cv-status-message"><h2>{statusNames[state.data.status]}</h2><p>{state.data.status === 'pending' ? '消费券已锁定，请等待商家确认。' : '当前消费券不再生成核销凭证。'}</p>{state.data.requestId && <Link className="cv-primary" to={`/coupon/pending/${state.data.requestId}`}>查看核销进度</Link>}</section>}</div>}<div className="cv-detail-bottom">{state.data && <details className="cv-rule-panel" open><summary><BillOutline />使用规则</summary><ol><li>{state.data.scope || `本券仅限${state.data.region}指定餐饮门店使用`}。</li><li>{state.data.rule}，每笔订单仅可使用1张。</li><li>本券不找零、不兑换现金，不与其他优惠同享。</li><li>如发生退货退款，优惠金额不予退还。</li><li>本页面为消费券演示项目。</li></ol><Artwork name="detail-rule-crane" className="cv-detail-rule-art" style={{ filter: `url(#${artFilterId})` }} /></details>}<Artwork name="detail-footer" className="cv-footer" /></div></div>;
}
