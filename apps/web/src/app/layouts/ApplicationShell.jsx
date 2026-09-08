import PropTypes from 'prop-types';

const ApplicationShell = ({ children }) => (
  <div className="app-shell">
    <main className="app-shell__content">{children}</main>
  </div>
);

ApplicationShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ApplicationShell;
