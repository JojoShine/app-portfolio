import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { CloseOutline } from 'antd-mobile-icons';
export default function Sheet({ title, onClose, children, className = '' }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  function onKeyDown(event) {
    if (event.key === 'Escape') onClose();
    if (event.key !== 'Tab') return;
    const items = dialog.current.querySelectorAll('a[href],button:not(:disabled),input,select,[tabindex="0"]');
    if (!items.length) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === items[0] || document.activeElement === dialog.current)) { event.preventDefault(); items[items.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
  }
  return <div className="cv-overlay" onClick={onClose}><section ref={dialog} tabIndex={-1} className={`cv-sheet ${className}`} onClick={(event) => event.stopPropagation()} onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-label={title}><div className="cv-sheet-handle" /><div className="cv-sheet-heading"><h2>{title}</h2><button className="cv-icon-button" aria-label="关闭" onClick={onClose}><CloseOutline /></button></div>{children}</section></div>;
}
Sheet.propTypes = { title: PropTypes.string.isRequired, onClose: PropTypes.func.isRequired, children: PropTypes.node, className: PropTypes.string };
