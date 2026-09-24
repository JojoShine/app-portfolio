import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CalendarOutline, ContentOutline, LeftOutline, UnorderedListOutline, UserOutline } from 'antd-mobile-icons';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 10.5 12 3l8.5 7.5" />
      <path d="M5.5 9.2V21h13V9.2M9.5 21v-6.5h5V21" />
    </svg>
  );
}

const tabs = [
  ['首页', '/library', HomeIcon], ['馆藏', '/library/catalog', ContentOutline],
  ['服务', '/library/services', UnorderedListOutline], ['活动', '/library/events', CalendarOutline],
  ['我的', '/library/profile', UserOutline],
];

export function BottomNav() {
  return <nav className="lib-tabbar grid w-full grid-cols-5" aria-label="主导航">{tabs.map(([label, to, Icon], index) => (
    <NavLink key={to} to={to} end={index === 0} className={({ isActive }) => isActive ? 'is-active' : ''}>
      <Icon /><span>{label}</span>
    </NavLink>
  ))}</nav>;
}

export function PageHeader({ title, action }) {
  const navigate = useNavigate();
  return <header className="lib-page-header grid w-full items-center"><button className="lib-back-button" type="button" aria-label="返回" onClick={() => navigate(-1)}><LeftOutline /></button><h1 className="min-w-0 text-center">{title}</h1><div className="flex min-w-0 justify-end">{action}</div></header>;
}

export function PersonalPageHeader({ title, action }) {
  return <section className="lib-personal-page-hero"><PageHeader title={title} action={action} /></section>;
}

export function PageState({ loading, error, onRetry }) {
  if (loading) return <div className="lib-skeleton grid" aria-label="正在加载"><i /><i /><i /></div>;
  if (error) return <div className="lib-error text-center"><p>{error}</p><button type="button" onClick={onRetry}>重新加载</button></div>;
  return null;
}

PageHeader.propTypes = { title: PropTypes.string.isRequired, action: PropTypes.node };
PersonalPageHeader.propTypes = { title: PropTypes.string.isRequired, action: PropTypes.node };
PageState.propTypes = { loading: PropTypes.bool, error: PropTypes.string, onRetry: PropTypes.func };
