import PropTypes from 'prop-types';
import Artwork from './Artwork';
export default function RecordRows({ records, onSelect, compact = false }) {
  return <div className={compact ? 'cv-record-rows' : 'cv-record-list'}>{records.map((record) => <button key={record.id} className="cv-record-row" onClick={() => onSelect(record)}>{compact && <span className="cv-user-avatar"><Artwork name="record-avatar" /></span>}<div><h3>{record.user}</h3><p>{compact ? `今天 ${new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : `${record.coupon.name} ${record.coupon.threshold ? `满${record.coupon.threshold}减${record.coupon.value}` : record.coupon.rule}`}</p></div>{compact ? <small>盐城惠民消费券</small> : <time>{new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</time>}<span className="cv-success-label">核销成功</span></button>)}</div>;
}
RecordRows.propTypes = { records: PropTypes.array.isRequired, onSelect: PropTypes.func.isRequired, compact: PropTypes.bool };
