import PropTypes from 'prop-types';
import { LocationFill } from 'antd-mobile-icons';
import Artwork from './Artwork';
export default function MerchantCard({ store, onNavigate }) {
  return <article className="cv-merchant-card"><Artwork name={store.image || 'merchant-food'} alt={store.name} /><div><h3>{store.name}</h3><p><strong>{store.distance || '1.2'} 公里</strong><span className="cv-open">营业中</span> {store.hours}</p><small><LocationFill /> {store.address}</small></div><aside><span>惠民券可用</span><button aria-label={`查看${store.name}门店`} onClick={() => onNavigate(store)}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.2 2.8 3.1 9.7a1 1 0 0 0 .1 1.9l7.1 2.1 2.1 7.1a1 1 0 0 0 1.9.1l6.9-18.1Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="m10.3 13.7 6.9-6.9" stroke="#f2f0eb" strokeWidth="1.2" strokeLinecap="round" /></svg><small>去这里</small></button></aside></article>;
}
MerchantCard.propTypes = { store: PropTypes.object.isRequired, onNavigate: PropTypes.func.isRequired };
