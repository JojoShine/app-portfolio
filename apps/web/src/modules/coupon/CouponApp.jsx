import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { appConfig } from '../../app/config/env';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import WalletPage from './pages/WalletPage';
import CouponPage from './pages/CouponPage';
import MerchantsPage from './pages/MerchantsPage';
import MerchantPage from './pages/MerchantPage';
import RulesPage from './pages/RulesPage';
import ManualCodePage from './pages/ManualCodePage';
import VerificationConfirmPage from './pages/VerificationConfirmPage';
import VerificationResultPage from './pages/VerificationResultPage';
import SelectCouponPage from './pages/SelectCouponPage';
import PendingPage from './pages/PendingPage';
import PendingListPage from './pages/PendingListPage';
import RecordsPage from './pages/RecordsPage';
import ScanPage from './pages/ScanPage';
import './coupon.css';
export default function CouponApp() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <div className="coupon-app"><Routes>
    <Route index element={<HomePage />} />
    <Route path="activities/:id" element={<ActivityPage />} />
    <Route path="wallet" element={<WalletPage />} />
    <Route path="wallet/:id" element={<CouponPage />} />
    <Route path="merchants" element={<MerchantsPage />} />
    <Route path="rules" element={<RulesPage />} />
    <Route path="select/:storeId" element={<SelectCouponPage />} />
    <Route path="pending/:id" element={<PendingPage />} />
    <Route path="result/:id" element={<VerificationResultPage />} />
    {appConfig.useMockApi && <>
      <Route path="merchant" element={<MerchantPage />} />
      <Route path="merchant/manual" element={<ManualCodePage />} />
      <Route path="merchant/scan" element={<ScanPage />} />
      <Route path="merchant/confirm" element={<VerificationConfirmPage />} />
      <Route path="merchant/pending" element={<PendingListPage />} />
      <Route path="merchant/records" element={<RecordsPage />} />
      <Route path="merchant/result/:id" element={<VerificationResultPage />} />
    </>}
    <Route path="*" element={<div className="cv-empty"><h1>页面不存在</h1><Link to="/coupon">返回首页</Link></div>} />
  </Routes></div>;
}
