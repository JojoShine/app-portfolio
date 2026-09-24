import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ActionSheet, ImageViewer } from 'antd-mobile';
import SnapIcon from './SnapIcon';
export default function PhotoSection({ photos, add, remove, retry, disabled, error, frame }) {
  const album = useRef(null), camera = useRef(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const selected = (event) => { add(event.target.files); event.target.value = ''; };
  return <section className="snap-card" id="snap-photos">
    <header className="snap-section-heading"><h2>问题照片</h2><span className="snap-count">{photos.length}<span> / 6</span></span></header>
    <input ref={album} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={selected} disabled={disabled} />
    <input ref={camera} hidden type="file" accept="image/*" capture="environment" onChange={selected} disabled={disabled} />
    {photos.length ? <div className="snap-photo-grid">{photos.map((photo, index) => <div className="snap-photo" key={photo.key}>
      <button type="button" className="snap-photo-preview" aria-label={`预览第${index + 1}张照片`} onClick={() => ImageViewer.Multi.show({ images: photos.map((item) => item.url), defaultIndex: index })}><img src={photo.url} alt={`问题现场照片${index + 1}`} /></button>
      <button type="button" className="snap-photo-remove" aria-label={`删除第${index + 1}张照片`} disabled={disabled} onClick={() => remove(photo.key)}><SnapIcon name="close" size={16} /></button>
      {photo.status === 'uploading' && <span className="snap-photo-state">上传中…</span>}
      {photo.status === 'failed' && <button type="button" className="snap-photo-state" onClick={() => retry(photo)} disabled={disabled}>上传失败 · 重试</button>}
    </div>)}{photos.length < 6 && <button type="button" className="snap-photo-add" disabled={disabled} onClick={() => setSourceOpen(true)}><SnapIcon name="plus" size={30} /><span>添加照片</span></button>}</div>
      : <button type="button" className="snap-capture" onClick={() => setSourceOpen(true)} disabled={disabled}><SnapIcon name="camera" size={38} /><strong>拍下身边的问题</strong><span>添加照片</span></button>}
    <ActionSheet visible={sourceOpen && !disabled} extra="添加照片" cancelText="取消" closeOnAction
      popupClassName="snap-source-popup" styles={{ body: { ...frame, right: 'auto', margin: 0 } }}
      actions={[{ key: 'camera', text: '拍摄照片' }, { key: 'album', text: '从相册选择' }]}
      onClose={() => setSourceOpen(false)} onAction={(action) => {
        if (disabled || photos.length >= 6) return;
        (action.key === 'camera' ? camera : album).current.click();
      }} />
    <p className="snap-muted">同一问题，可补充全景和细节。</p>
    <p className="snap-caption">照片将用于 AI 辅助识别，请避免拍摄无关个人信息。</p>
    {error && <p className="snap-error" role="alert">{error}</p>}
    {photos.some((photo) => photo.status === 'failed') && <p className="snap-error">{photos.find((photo) => photo.status === 'failed').error}</p>}
  </section>;
}
PhotoSection.propTypes = { photos: PropTypes.array.isRequired, add: PropTypes.func.isRequired, remove: PropTypes.func.isRequired, retry: PropTypes.func.isRequired, disabled: PropTypes.bool, error: PropTypes.string, frame: PropTypes.object.isRequired };
