import { useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { CloseOutline } from 'antd-mobile-icons';

export default function LibraryDialog({ open, title, children, variant, confirmText = '我知道了', cancelText, busy = false, onConfirm, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return <dialog ref={ref} className={`lib-dialog${variant ? ` lib-dialog-${variant}` : ''}`} aria-labelledby={titleId} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="lib-dialog-paper">
      <header><span className="lib-dialog-eyebrow">书香海安 · 读者服务</span><button type="button" className="lib-dialog-close" aria-label="关闭弹窗" disabled={busy} onClick={onClose}><CloseOutline /></button></header>
      <h2 id={titleId}>{title}</h2>
      <div className="lib-dialog-content">{children}</div>
      <footer>{cancelText && <button type="button" className="lib-dialog-secondary" disabled={busy} onClick={onClose}>{cancelText}</button>}<button type="button" className="lib-dialog-primary" disabled={busy} onClick={onConfirm || onClose}>{busy ? '处理中…' : confirmText}</button></footer>
    </div>
  </dialog>;
}

LibraryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['reader-code', 'event-registration']),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  busy: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
