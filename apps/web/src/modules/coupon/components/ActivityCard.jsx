import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ClockCircleOutline, AppstoreOutline } from 'antd-mobile-icons';
import Artwork from './Artwork';
import CouponValue from './CouponValue';
export default function ActivityCard({ activity }) {
  const ticket = activity.tickets[0];
  const threshold = ticket.threshold || ticket.rule?.match(/满(\d+)/)?.[1] || '';
  const wideAmount = String(threshold).length + String(ticket.value).length > 5;
  return <article className="cv-activity-card"><Artwork name="home-food" alt="寻味建湖，烟火人间" className="cv-activity-photo" /><div className="cv-activity-content"><h2>{activity.name}</h2><p>{activity.subtitle}</p><div className={`cv-activity-offer ${wideAmount ? 'is-wide' : ''}`}><svg className="cv-activity-offer-frame" viewBox="0 0 345 100" preserveAspectRatio="none" aria-hidden="true"><path d="M11 1H334Q344 1 344 12V17q-5 3 0 6q-5 3 0 6q-5 3 0 6q-5 3 0 6q-12 9 0 18q-5 3 0 6q-5 3 0 6q-5 3 0 6q-5 3 0 6V88Q344 99 334 99H11Q1 99 1 88V83q5-3 0-6q5-3 0-6q5-3 0-6q5-3 0-6q12-9 0-18q5-3 0-6q5-3 0-6q5-3 0-6q5-3 0-6V12Q1 1 11 1Z" fill="#fff1dc" fillOpacity=".65" stroke="#efc8a6" strokeWidth=".7" vectorEffect="non-scaling-stroke" /></svg><CouponValue coupon={activity.tickets[0]} /></div><div className="cv-activity-info"><span><AppstoreOutline /> 库存{activity.tickets[0].stock}</span><span><ClockCircleOutline /> {activity.nextBatchLabel || '9月12日 10:00开抢'}</span></div><Link className="cv-primary" to={`/coupon/activities/${activity.id}`}>{activity.status === 'active' ? '立即抢券' : '查看活动'}<svg className="cv-activity-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link></div></article>;
}
ActivityCard.propTypes = { activity: PropTypes.object.isRequired };
