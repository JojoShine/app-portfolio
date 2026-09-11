import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RightOutline, CheckShieldOutline, CameraOutline } from 'antd-mobile-icons';
import { useQrScanner } from '../hooks/useQrScanner';
import PageHeader from '../components/PageHeader';
import Artwork from '../components/Artwork';
export default function ScanPage() {
  const navigate = useNavigate();
  const file = useRef(null);
  const scanner = useQrScanner((code) => navigate(`/coupon/merchant/confirm?code=${code}&store=${encodeURIComponent(sessionStorage.getItem('coupon-store') || 'store-1')}`));
  return <div className="cv-scan"><PageHeader title="扫码核销" back="/coupon/merchant" /><Artwork name="scan-top" className="cv-scan-top" /><div className="cv-scan-area"><Artwork name="scan-landscape" /><video ref={scanner.video} playsInline muted className={scanner.status === 'scanning' ? 'is-active' : ''} />{scanner.status !== 'scanning' && <button className="cv-scan-enable" disabled={scanner.status === 'requesting'} onClick={scanner.start}><CameraOutline />{scanner.status === 'requesting' ? '正在开启摄像头…' : scanner.status === 'error' ? '重新开启摄像头' : '开启摄像头扫码'}</button>}</div><div className="cv-scan-bottom"><h2>扫描用户出示的动态二维码</h2>{scanner.error && <p className="cv-scan-error" role="alert">{scanner.error}</p>}<div className="cv-scan-tools"><button onClick={scanner.toggleTorch}><Artwork name="scan-torch-icon" /><span>{scanner.torch ? '关闭手电筒' : '打开手电筒'}</span></button><button onClick={() => file.current?.click()}><Artwork name="scan-album-icon" /><span>从相册选择</span></button><input ref={file} type="file" accept="image/*" hidden onChange={(event) => { scanner.readFile(event.target.files?.[0]); event.target.value = ''; }} /></div><Link className="cv-scan-manual" to="/coupon/merchant/manual">手输核销码 <RightOutline /></Link><p className="cv-scan-security"><CheckShieldOutline />仅用于消费券核销</p><Artwork name="scan-footer" className="cv-scan-footer" /></div></div>;
}
