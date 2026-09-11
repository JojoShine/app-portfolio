import PropTypes from 'prop-types';
import { LoopOutline, CheckShieldOutline } from 'antd-mobile-icons';
import { useCountdown } from '../hooks/useCountdown';
export default function CouponCredential({ credential, onOpen, opened }) {
  const { seconds } = useCountdown(credential.expiresAt);
  return <section className="cv-credential">{!opened ? <><h2>消费券核销凭证</h2><p>到店消费时，向商家出示动态核销码</p><button className="cv-primary" onClick={onOpen}>出示核销码</button></> : credential.loading ? <div className="cv-qr-loading" role="status">正在生成核销凭证…</div> : credential.error ? <div role="alert"><p>{credential.error}</p><button className="cv-outline" onClick={credential.refresh}>重新获取</button></div> : seconds > 0 && <><img className="cv-qr" src={credential.qr} alt="本张消费券的动态核销二维码" /><h2>请出示给商家扫码</h2><strong className="cv-dynamic-code">{credential.code.slice(0, 4)} {credential.code.slice(4)}</strong><button className="cv-refresh" onClick={credential.refresh}><LoopOutline /> {Math.min(seconds, 60)}秒后刷新</button></>}<div className="cv-credential-privacy"><span><CheckShieldOutline /> 请勿截图转发</span><p>为保障资金安全，请勿截屏、拍照或转发给他人使用。</p></div></section>;
}
CouponCredential.propTypes = { credential: PropTypes.object.isRequired, onOpen: PropTypes.func.isRequired, opened: PropTypes.bool.isRequired };
