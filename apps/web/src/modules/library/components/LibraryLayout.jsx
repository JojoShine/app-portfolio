import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AppOutline, CalendarOutline, ContentOutline, LeftOutline, UnorderedListOutline, UserOutline } from 'antd-mobile-icons';

const tabs = [
  ['首页', '/library', AppOutline], ['馆藏', '/library/catalog', ContentOutline],
  ['服务', '/library/services', UnorderedListOutline], ['活动', '/library/events', CalendarOutline],
  ['我的', '/library/profile', UserOutline],
];

export function BottomNav() {
  return <nav className="lib-tabbar" aria-label="主导航">{tabs.map(([label, to, Icon], index) => (
    <NavLink key={to} to={to} end={index === 0} className={({ isActive }) => isActive ? 'is-active' : ''}>
      <Icon /><span>{label}</span>
    </NavLink>
  ))}</nav>;
}

export function PageHeader({ title, action }) {
  const navigate = useNavigate();
  return <header className="lib-page-header"><button type="button" aria-label="返回" onClick={() => navigate(-1)}><LeftOutline /></button><h1>{title}</h1><div>{action}</div></header>;
}

export function PageState({ loading, error, onRetry }) {
  if (loading) return <div className="lib-skeleton" aria-label="正在加载"><i /><i /><i /></div>;
  if (error) return <div className="lib-error"><p>{error}</p><button type="button" onClick={onRetry}>重新加载</button></div>;
  return null;
}

PageHeader.propTypes = { title: PropTypes.string.isRequired, action: PropTypes.node };
PageState.propTypes = { loading: PropTypes.bool, error: PropTypes.string, onRetry: PropTypes.func };
