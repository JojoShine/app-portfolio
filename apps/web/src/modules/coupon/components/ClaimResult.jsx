import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CheckCircleFill } from 'antd-mobile-icons';
import Sheet from './Sheet';
import Artwork from './Artwork';
import CouponValue from './CouponValue';
export default function ClaimResult({ result, onClose }) {
  return <Sheet title={result.coupon ? '领取成功' : '领取结果'} onClose={onClose} className="cv-claim-sheet">{result.coupon ? <><Artwork name="claim-heading" alt="领取成功，惠享盐城，美好生活" /><div className="cv-claim-ticket"><div>盐城<br />惠民消费季<small>YANCHENG<br />CONSUMPTION<br />SEASON</small></div><div><CouponValue coupon={result.coupon} /><p>有效期 {result.coupon.validityLabel || new Date(result.coupon.expiresAt).toLocaleDateString('zh-CN')}</p></div><div>山海盐城<br />向美而行</div></div><h3><CheckCircleFill /> 已放入我的券包</h3><p>可在「我的券包」中查看和使用</p><Link className="cv-primary" to={`/coupon/wallet/${result.coupon.id}`}>立即查看 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link></> : <div className="cv-feedback"><h2>{result.title}</h2><p>{result.message}</p></div>}<button className="cv-text-button" onClick={onClose}>继续逛逛</button><Artwork name="claim-footer" alt="盐城湿地风光，湿地之城 自在生活" /></Sheet>;
}
ClaimResult.propTypes = { result: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired };
