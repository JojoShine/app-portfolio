import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LocationFill } from 'antd-mobile-icons';
import { useCountdown } from '../hooks/useCountdown';
import Artwork from './Artwork';
import CouponValue from './CouponValue';
export default function PendingRequestCard({ request }) {
  const { label } = useCountdown(request.expiresAt);
  return <article className="cv-pending-card"><header><span className="cv-user-avatar"><Artwork name="record-avatar" /></span><div><h3>{request.user}</h3><p>申请时间：{new Date(request.createdAt).toLocaleString('zh-CN', { hour12: false })}</p></div><aside>剩余确认时间<strong>{label}</strong></aside></header><div><Artwork name="pending-list-coupon-icon" /><section><h3>{request.coupon.name}</h3><CouponValue coupon={request.coupon} /><p><LocationFill /> {request.store.branch || request.store.name}</p></section><Link className="cv-primary" to={`/coupon/merchant/confirm?pending=${request.id}`}>去确认</Link></div></article>;
}
PendingRequestCard.propTypes = { request: PropTypes.object.isRequired };
