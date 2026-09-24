import PropTypes from 'prop-types';
export default function FilePreview({url,onClose}){return url?<div className="pm-modal" role="dialog" aria-modal="true" aria-label="材料预览"><div><button className="pm-secondary" onClick={onClose}>关闭预览</button><iframe title="材料预览" src={url}/><a href={url} target="_blank" rel="noreferrer">在新窗口查看</a></div></div>:null;}
FilePreview.propTypes={url:PropTypes.string,onClose:PropTypes.func};
