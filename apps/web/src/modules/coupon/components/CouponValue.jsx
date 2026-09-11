import PropTypes from 'prop-types';
export default function CouponValue({ coupon, className = '' }) {
  const threshold = coupon.threshold || coupon.rule?.match(/满(\d+)/)?.[1];
  return <div className={`cv-value ${className}`}>{threshold ? <><em className="cv-value-label">满</em><strong>{threshold}</strong><em className="cv-value-label">减</em><strong>{coupon.value}</strong></> : coupon.unit === '折' ? <><strong>{coupon.value}</strong>折</> : <><span>{coupon.unit === '元' ? '¥' : ''}</span><strong>{coupon.value}</strong>{coupon.unit !== '元' && coupon.unit !== '折' ? coupon.unit : ''}</>}</div>;
}
CouponValue.propTypes = { coupon: PropTypes.object.isRequired, className: PropTypes.string };
