import PropTypes from 'prop-types';
import { LocationOutline, LoopOutline, RightOutline } from 'antd-mobile-icons';
import Artwork from './Artwork';
export default function MerchantIdentity({ store, onSwitch }) {
  return <div className="cv-merchant-identity"><div className="cv-merchant-avatar"><Artwork name="merchant-avatar" /></div><div><h2>{store?.shortName || store?.name || '演示商家'}</h2><p>{store?.branch || '当前门店'}</p><small><LocationOutline /> {store?.address}</small></div>{onSwitch && <button onClick={onSwitch}><LoopOutline />演示商家切换 <RightOutline /></button>}<Artwork name="merchant-card-art" className="cv-identity-landscape" /></div>;
}
MerchantIdentity.propTypes = { store: PropTypes.object, onSwitch: PropTypes.func };
