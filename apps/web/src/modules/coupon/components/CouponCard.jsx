import PropTypes from 'prop-types';
import { useId } from 'react';
import { CalendarOutline, RightOutline, ShopbagOutline } from 'antd-mobile-icons';
import { statusNames } from '../constants/options';
import Artwork from './Artwork';
import CouponValue from './CouponValue';
export default function CouponCard({ coupon, children, selected, onSelect, variant = 'wallet' }) {
  const artFilterId = useId();
  const theme = coupon.category === '家电' ? 'appliance' : coupon.category === '文旅' ? 'travel' : 'dining';
  return <article className={`cv-ticket cv-ticket--${variant} cv-ticket--${theme} ${selected ? 'is-selected' : ''}`}>
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={artFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={variant === 'select' ? '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -2.5512 -8.5824 -.8664 0 11.16' : '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 19.2'} /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg>
    {variant === 'wallet' || variant === 'select' ? <Artwork className="cv-ticket-stub" name={variant === 'select' ? (coupon.type === '代金券' ? 'select-voucher-stub' : 'select-dining-stub') : `ticket-${theme}-stub`} /> : null}
    <div className="cv-ticket-body"><h3>{coupon.name}</h3>{variant === 'wallet' && <p className="cv-ticket-subtitle">{coupon.subtitle || '品味湖鲜 · 尽享金秋'}</p>}<div className="cv-ticket-value-row"><CouponValue coupon={coupon} />{coupon.unit === '折' && <small>{coupon.rule}</small>}</div><div className="cv-ticket-meta"><span><ShopbagOutline />{coupon.scope || `${coupon.region || '建湖县'}指定${coupon.category || '餐饮'}门店`}</span><span><CalendarOutline />{coupon.validityLabel || (coupon.expiresAt ? `${new Date(Date.parse(coupon.expiresAt) - 30 * 86400000).toLocaleDateString('zh-CN').replaceAll('/', '.')} — ${new Date(coupon.expiresAt).toLocaleDateString('zh-CN').replaceAll('/', '.')}` : `领取后${coupon.days || 7}天有效`)}</span></div>{children}</div>
    <Artwork className="cv-ticket-decoration" style={{ filter: `url(#${artFilterId})` }} name={variant === 'select' ? (coupon.type === '代金券' ? 'select-ticket-crane' : 'select-ticket-reeds') : theme === 'dining' ? 'ticket-crane' : theme === 'travel' ? 'ticket-tower' : 'ticket-appliance'} />
    {variant === 'select' ? <button className="cv-radio" aria-label={`选择${coupon.name}`} aria-pressed={selected} onClick={onSelect} /> : <span className={`cv-stamp ${coupon.status === 'used' ? 'is-used' : ''} ${coupon.status === 'available' ? 'cv-stamp--art' : ''}`}>{coupon.status === 'available' ? <Artwork name={theme === 'dining' ? 'wallet-stamp-orange' : 'wallet-stamp-gray'} alt="可使用" /> : statusNames[coupon.status] || '可使用'}</span>}
    {variant === 'wallet' && <RightOutline className="cv-ticket-arrow" />}
  </article>;
}
CouponCard.propTypes = { coupon: PropTypes.object.isRequired, children: PropTypes.node, selected: PropTypes.bool, onSelect: PropTypes.func, variant: PropTypes.string };
