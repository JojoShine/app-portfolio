import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useMall } from './hooks/useMall';
import { MallContext } from './components/MallContext';
import { Header, Empty } from './components/UI';
import { HomePage, ProductsPage, ProductPage, ActivitiesPage, ActivityPage } from './pages/ShopPages';
import { CheckInPage, PointsPage, MePage, HelpPage } from './pages/AccountPages';
import { CheckoutPage, ResultPage, OrdersPage, OrderPage } from './pages/OrderPages';
import { CouponsPage, CollectionPage, AddressesPage, SupportPage } from './pages/MemberPages';
import { BottomNav } from './components/UI';
import './green-points.css';
export default function GreenPointsApp() {
  const mall = useMall();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '绿色积分商城';
  }, [location.pathname]);
  return <div className="gp-app">
<MallContext.Provider value={mall}>{mall.error ? <>
<Header title="绿色积分商城" />
<Empty text={mall.error}>
<button className="gp-button" onClick={mall.reload}>重新加载</button>
</Empty>
</> : !mall.data ? <div className="gp-content gp-loading" aria-label="正在加载商城">
<div />
<div />
<div />
</div> : <Routes>
<Route index element={<HomePage />} />
<Route path="products" element={<ProductsPage />} />
<Route path="products/:id" element={<ProductPage />} />
<Route path="check-in" element={<CheckInPage />} />
<Route path="points" element={<PointsPage />} />
<Route path="activities" element={<ActivitiesPage />} />
<Route path="activities/:id" element={<ActivityPage />} />
<Route path="checkout/:id" element={<CheckoutPage />} />
<Route path="orders" element={<OrdersPage />} />
<Route path="orders/:id" element={<OrderPage />} />
<Route path="orders/:id/result" element={<ResultPage />} />
<Route path="me" element={<MePage />} />
<Route path="coupons" element={<CouponsPage />} />
<Route path="collection" element={<CollectionPage />} />
<Route path="addresses" element={<AddressesPage />} />
<Route path="support" element={<SupportPage />} />
<Route path="help" element={<HelpPage />} />
<Route path="*" element={<>
<Header title="页面不存在" />
<Empty text="页面不存在" />
</>} />
</Routes>}{mall.data && <BottomNav />}</MallContext.Provider>
</div>;
}
