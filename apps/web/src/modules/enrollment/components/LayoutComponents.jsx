import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { NavBar } from 'antd-mobile';
import { ContentOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';
import enrollmentSchoolHero from '../assets/enrollment-school-hero.png';

export const EnrollmentLayout = ({ children }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const syncBounds = () => {
      const { left, width } = container.getBoundingClientRect();
      container.style.setProperty('--enroll-container-left', `${left}px`);
      container.style.setProperty('--enroll-container-width', `${width}px`);
    };
    syncBounds();
    const observer = new ResizeObserver(syncBounds);
    observer.observe(container);
    window.addEventListener('resize', syncBounds);
    window.addEventListener('scroll', syncBounds, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncBounds);
      window.removeEventListener('scroll', syncBounds, true);
    };
  }, []);

  return <div className="enrollment-app" ref={containerRef}>{children}</div>;
};

EnrollmentLayout.propTypes = { children: PropTypes.node.isRequired };

export const PageHeader = ({ title, onBack = null, right = null }) => (
  <NavBar
    className="enrollment-navbar"
    backArrow={onBack ? <LeftOutline /> : false}
    onBack={onBack}
    right={right}
  >
    {title}
  </NavBar>
);

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  right: PropTypes.node,
};

export const SectionTitle = ({ children, action = null }) => (
  <div className="enrollment-section-title">
    <h2>{children}</h2>
    {action}
  </div>
);

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
  action: PropTypes.node,
};

export const GovHero = ({ eyebrow = '', title, subtitle, compact = false, visual = '' }) => (
  <section className={`gov-hero${compact ? ' gov-hero--compact' : ''}${visual ? ` gov-hero--${visual}` : ''}`}>
    <div className="gov-hero__copy">
      {eyebrow && <span>{eyebrow}</span>}
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    <img className="gov-hero__illustration" src={enrollmentSchoolHero} alt="" aria-hidden="true" />
  </section>
);

GovHero.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  compact: PropTypes.bool,
  visual: PropTypes.string,
};

export const ServiceHero = ({ title, subtitle }) => (
  <GovHero title={title} subtitle={subtitle} compact visual="service" />
);

ServiceHero.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export const FixedActionBar = ({ children, secondary = null }) => (
  <div className="fixed-action-bar">
    {secondary}
    {children}
  </div>
);

FixedActionBar.propTypes = {
  children: PropTypes.node.isRequired,
  secondary: PropTypes.node,
};

export const InfoLink = ({ icon: Icon = ContentOutline, label, onClick = null, value = '' }) => (
  <button className="info-link" type="button" onClick={onClick}>
    <Icon />
    <span>{label}</span>
    {value && <strong>{value}</strong>}
    <RightOutline />
  </button>
);

InfoLink.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  value: PropTypes.string,
};
