import PropTypes from 'prop-types';
import SnapIcon from './SnapIcon';
import useLocationPicker from '../hooks/useLocationPicker';
export default function LocationSheet({ initial, onConfirm, onClose }) {
  const picker = useLocationPicker(initial);
  const confirm = () => {
    if (!picker.value.address.trim()) {
      picker.setError('请填写发生地址'); return;
    }
    onConfirm({ ...picker.value, address: picker.value.address.trim() });
  };
  return <section className="snap-sheet-inner">
    <header className="snap-sheet-heading"><h2>确认发生位置</h2><button className="snap-icon-button" aria-label="关闭位置选择" onClick={onClose}><SnapIcon name="close" /></button></header>
    <form className="snap-code-row" onSubmit={(event) => { event.preventDefault(); picker.search(); }}><input aria-label="搜索海安市内地址" placeholder="搜索道路、地标或小区" value={picker.query} onChange={(event) => picker.setQuery(event.target.value)} /><button disabled={picker.busy}>搜索</button></form>
    {picker.results.length > 0 && <div className="snap-search-results">{picker.results.map((item, index) => <button key={index} onClick={() => { picker.select(item); picker.setQuery(''); }}>{item.address}</button>)}</div>}
    <div className="snap-map" style={picker.mapError ? { height: 0, margin: 0 } : undefined} ref={picker.setNode} aria-label="点击地图选择位置" />
    {picker.mapError && <p className="snap-muted">{picker.mapError}</p>}
    <button className="snap-text-button" disabled={picker.busy} onClick={picker.locate}>定位到当前位置</button>
    <label className="snap-field">发生地址<input value={picker.value.address} maxLength={300} onChange={(event) => picker.edit('address', event.target.value)} /></label>
    <label className="snap-field">补充位置<input value={picker.value.detail} maxLength={200} placeholder="例如路口东侧人行道旁" onChange={(event) => picker.edit('detail', event.target.value)} /></label>
    <p className="snap-muted">请确认照片实际发生位置，而非当前所在位置。</p>
    {picker.error && <p role="alert" className="snap-error">{picker.error}</p>}
    <button className="snap-primary" onClick={confirm}>确认位置</button>
  </section>;
}
LocationSheet.propTypes = { initial: PropTypes.object.isRequired, onConfirm: PropTypes.func.isRequired, onClose: PropTypes.func.isRequired };
