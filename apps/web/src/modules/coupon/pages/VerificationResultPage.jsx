import { useCallback, useId } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { getVerification } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import PageHeader from '../components/PageHeader';
import Artwork from '../components/Artwork';
import VerificationReceipt from '../components/VerificationReceipt';
import DataState from '../components/DataState';
import resultReference from '../../../../../../docs/coupon/ui/15-merchant-result.png';
export default function VerificationResultPage() {
  const artFilter = useId();
  const { id } = useParams();
  const merchant = useLocation().pathname.includes('/merchant/');
  const state = useCouponData(useCallback(() => getVerification(id), [id]));
  return <div className={`cv-result ${merchant ? 'cv-result--merchant' : 'cv-result--user'}`} style={{ '--cv-result-art-filter': `url(#${artFilter})` }}><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={artFilter} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 18.9" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><PageHeader title={merchant ? '核销完成' : '核销结果'} back={merchant ? '/coupon/merchant' : '/coupon/wallet'} /><Artwork name={merchant ? 'merchant-result-banner' : 'user-result-banner'} className="cv-result-banner" /><DataState {...state} />{state.data && <div className="cv-page-padding"><div className="cv-result-receipt-wrap"><VerificationReceipt record={state.data} merchant={merchant} /></div><nav className="cv-two-actions"><Link className="cv-outline" to={merchant ? '/coupon/merchant/records' : '/coupon/wallet'}>{merchant ? '查看记录' : '返回卡包'}</Link><Link className="cv-primary" to={merchant ? '/coupon/merchant/scan' : '/coupon'}>{merchant ? '继续核销' : '返回首页'}</Link></nav></div>}<>{merchant ? <div className="cv-footer cv-result-merchant-footer" aria-hidden="true" style={{ backgroundImage: `url(${resultReference})` }} /> : <Artwork name="user-result-footer" className="cv-footer" />}</></div>;
}
