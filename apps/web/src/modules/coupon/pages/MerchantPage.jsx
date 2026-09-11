import { useCallback, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanCodeOutline, RightOutline, SoundOutline, SoundMuteOutline } from 'antd-mobile-icons';
import { listMerchants } from '../services/merchant.service';
import { listVerifications, listPendingRequests } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import Artwork from '../components/Artwork';
import merchantReference from '../../../../../../docs/coupon/ui/10-merchant-home.png';
import MerchantIdentity from '../components/MerchantIdentity';
import RecordRows from '../components/RecordRows';
import Sheet from '../components/Sheet';
import DataState from '../components/DataState';
export default function MerchantPage() {
  const artFilterId = useId();
  const stores = useCouponData(listMerchants);
  const [storeId, setStoreId] = useState(() => sessionStorage.getItem('coupon-store') || 'store-1');
  const [switching, setSwitching] = useState(false);
  const [sound, setSound] = useState(true);
  const records = useCouponData(useCallback(() => listVerifications(storeId), [storeId]));
  const pending = useCouponData(useCallback(() => listPendingRequests(storeId), [storeId]));
  const navigate = useNavigate();
  const store = stores.data?.find((item) => item.id === storeId);
  const today = records.data?.filter((item) => new Date(item.createdAt).toDateString() === new Date().toDateString()).length || 0;
  return <div className="cv-merchant-home" style={{ '--cv-merchant-art-filter': `url(#${artFilterId})` }}><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={artFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 18.9" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><div className="cv-merchant-home-hero"><Artwork name="merchant-header" alt="盐城，湿地之城幸福盐城，商家核销" /></div><div className="cv-page-padding"><DataState {...stores} /><section className="cv-merchant-actions"><MerchantIdentity store={store} onSwitch={() => setSwitching(true)} /><Link className="cv-scan-entry" to="/coupon/merchant/scan"><ScanCodeOutline /><strong>扫码核销</strong><RightOutline /></Link><Link className="cv-manual-entry" to="/coupon/merchant/manual"><Artwork name="merchant-keyboard" /><strong>手输8位核销码</strong><RightOutline /></Link><div className="cv-pending-strip"><Link to="/coupon/merchant/pending"><span className="cv-pending-strip-icon" aria-hidden="true" style={{ backgroundImage: `url(${merchantReference})` }} /><span className="cv-pending-strip-label">待确认申请</span><strong>{pending.data?.length || 0}</strong><span>笔</span></Link><button onClick={() => setSound(!sound)}>{sound ? <SoundOutline /> : <SoundMuteOutline />}提示音已{sound ? '开启' : '关闭'} <RightOutline /></button></div></section><section className="cv-merchant-stats"><span className="cv-merchant-stats-scene" aria-hidden="true" style={{ backgroundImage: `url(${merchantReference})` }} /><div><p>今日核销</p><strong>{today}</strong><span>笔</span></div><div><p>累计核销</p><strong>{records.data?.length || 0}</strong><span>笔</span></div><p className="cv-merchant-stats-motto">— 绿水青山就是幸福生活</p></section><section className="cv-recent-records"><header><h2>最近核销记录</h2><Link to="/coupon/merchant/records">查看全部 <RightOutline /></Link></header><DataState {...records} />{records.data && <RecordRows records={records.data.slice(0, 4)} compact onSelect={(item) => navigate(`/coupon/merchant/result/${item.id}`)} />}{records.data?.length === 0 && <p className="cv-empty">暂无核销记录</p>}</section></div><div className="cv-footer cv-merchant-footer" role="img" aria-label="盐城，一座让人想再来的城市，芦苇山水风景" style={{ backgroundImage: `url(${merchantReference})` }} />{switching && <Sheet title="切换演示门店" onClose={() => setSwitching(false)}>{stores.data?.map((item) => <button key={item.id} className="cv-sheet-option" onClick={() => { sessionStorage.setItem('coupon-store', item.id); setStoreId(item.id); setSwitching(false); }}>{item.name}<RightOutline /></button>)}<Link className="cv-sheet-option" to="/coupon">切换到用户端<RightOutline /></Link></Sheet>}</div>;
}
