import PropTypes from 'prop-types';
import { Tag } from 'antd-mobile';
import { DownOutline, UpOutline } from 'antd-mobile-icons';

export const TimelineCluster = ({
  number,
  title,
  status,
  statusTone,
  expanded,
  editable = true,
  onToggle,
  onEdit = null,
  summary,
  children,
}) => (
  <section className={`timeline-cluster${expanded ? ' timeline-cluster--expanded' : ''}`}>
    <div className="timeline-cluster__rail"><span>{number}</span></div>
    <div className="timeline-cluster__main">
      <div className="timeline-cluster__head">
        <button type="button" className="timeline-cluster__title" onClick={onToggle}>
          <strong>{title}</strong>
          <Tag color={statusTone}>{status}</Tag>
        </button>
        {editable && <button type="button" className="timeline-cluster__edit" onClick={onEdit}>修改</button>}
        <button type="button" className="icon-button" onClick={onToggle} aria-label={expanded ? `收起${title}` : `展开${title}`}>
          {expanded ? <UpOutline /> : <DownOutline />}
        </button>
      </div>
      <div className="timeline-cluster__body">
        {expanded ? children : <p className="timeline-cluster__summary">{summary}</p>}
      </div>
    </div>
  </section>
);

TimelineCluster.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  statusTone: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  editable: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  summary: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
