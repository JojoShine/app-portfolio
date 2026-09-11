import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCoupons } from '../services/wallet.service';
import { useCouponData } from '../hooks/useCouponData';
import CouponCard from '../components/CouponCard';
import Artwork from '../components/Artwork';
import walletFooter from '../assets/wallet-footer.png';
import DataState from '../components/DataState';
export default function WalletPage() {
  const footerFilterId = useId();
  const state = useCouponData(listCoupons);
  const [status, setStatus] = useState('available');
  const [type, setType] = useState('全部');
  const rows = state.data?.filter((item) => (item.status === status || (status === 'available' && item.status === 'pending')) && (type === '全部' || item.type === type));
  return <div className="cv-wallet"><section className="cv-wallet-hero"><Artwork name="wallet-landscape" /><h1>我的卡包</h1><p>汇聚盐城惠民好券 畅享美好生活</p></section><div className="cv-page-padding"><section className="cv-wallet-summary"><div><h2>可使用券</h2><p><strong>{state.data?.filter((item) => item.status === 'available').length || 0}</strong> 张</p></div><Artwork name="wallet-count-art" /></section><div className="cv-pill-tabs">{['全部', '满减券', '代金券', '折扣券', '品类券'].map((item) => <button key={item} aria-pressed={type === item} onClick={() => setType(item)}>{item === '代金券' ? '抵用券' : item}</button>)}</div><div className="cv-status-tabs">{[['available', '可使用'], ['used', '已使用'], ['expired', '已过期']].map(([value, label]) => <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}</button>)}</div><DataState {...state} /><div className="cv-wallet-list">{rows?.map((coupon) => <Link key={coupon.id} aria-label={`${coupon.name} ${coupon.rule} 查看详情`} to={`/coupon/wallet/${coupon.id}`}><CouponCard coupon={coupon} /></Link>)}</div>{rows?.length === 0 && <div className="cv-empty"><h2>暂无{status === 'available' ? '可使用' : status === 'used' ? '已使用' : '已过期'}消费券</h2><p>一张券，让美好发生在盐城</p><Link className="cv-primary" to="/coupon">去领取消费券</Link></div>}</div><div className="cv-footer cv-wallet-footer" role="img" aria-label="盐城惠民消费季，Yancheng for a better life"><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={footerFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 18.9" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><span style={{ backgroundImage: `url(${walletFooter})`, filter: `url(#${footerFilterId})` }} /></div></div>;
}
