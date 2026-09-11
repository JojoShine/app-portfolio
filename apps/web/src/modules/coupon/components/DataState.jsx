import PropTypes from 'prop-types';
export default function DataState({ loading, error, reload }) {
  if (loading) return <div className="coupon-loading" role="status">正在加载消费券…<i /><i /></div>;
  if (error) return <div className="coupon-notice" role="alert"><p>{error}</p><button onClick={reload}>重新加载</button></div>;
  return null;
}
DataState.propTypes = { loading: PropTypes.bool, error: PropTypes.string, reload: PropTypes.func };
