import PropTypes from 'prop-types';
import { Tag } from 'antd-mobile';
import {
  CheckCircleFill,
  ExclamationCircleFill,
  InformationCircleFill,
  TeamOutline,
} from 'antd-mobile-icons';

export const SourceTag = ({ type }) => {
  const config = {
    department: { text: '部门数据', className: 'source-tag--department' },
    manual: { text: '家长填写', className: 'source-tag--manual' },
    modified: { text: '用户已修改', className: 'source-tag--modified' },
    fallback: { text: '查询失败后补充', className: 'source-tag--fallback' },
  }[type] || { text: type, className: '' };

  return <Tag className={`source-tag ${config.className}`}>{config.text}</Tag>;
};

SourceTag.propTypes = { type: PropTypes.string.isRequired };

export const StatusTag = ({ status }) => {
  const tone = {
    待提交: 'default',
    审核中: 'primary',
    退回修改: 'warning',
    初审通过: 'success',
    初审不通过: 'danger',
    已录取: 'success',
  }[status] || 'default';
  return <Tag color={tone}>{status}</Tag>;
};

StatusTag.propTypes = { status: PropTypes.string.isRequired };

export const SummaryRows = ({ rows }) => (
  <div className="summary-rows">
    {rows.filter((row) => row.value !== undefined && row.value !== '').map((row) => (
      <div className="summary-row" key={row.label}>
        <span>{row.label}</span>
        <strong>{row.value || '待补充'}</strong>
      </div>
    ))}
  </div>
);

SummaryRows.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
  })).isRequired,
};

export const CompactNotice = ({ type = 'info', children }) => (
  <div className={`compact-notice compact-notice--${type}`}>
    {type === 'success' ? <CheckCircleFill /> : type === 'warning' ? <ExclamationCircleFill /> : <InformationCircleFill />}
    <span>{children}</span>
  </div>
);

CompactNotice.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning']),
  children: PropTypes.node.isRequired,
};

export const ResultIdentity = () => (
  <div className="result-identity"><TeamOutline /> 李*然 <span>·</span> 证件尾号 2318</div>
);
