import { Button, DotLoading, ErrorBlock } from 'antd-mobile';
import PropTypes from 'prop-types';

const PageState = ({ loading = false, error = null, onRetry = null, children }) => {
  if (loading) {
    return <div className="page-state"><DotLoading color="primary" /></div>;
  }

  if (error) {
    return (
      <div className="page-state">
        <ErrorBlock
          className="page-state__error"
          status="disconnected"
          title="加载失败"
          description={error.message}
        />
        {onRetry && (
          <Button className="page-state__retry" color="primary" fill="outline" onClick={onRetry}>
            重试
          </Button>
        )}
      </div>
    );
  }

  return children;
};

PageState.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.shape({ message: PropTypes.string }),
  onRetry: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default PageState;
