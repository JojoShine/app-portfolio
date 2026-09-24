import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { DotLoading, ErrorBlock } from 'antd-mobile';
import { appConfig } from '../config/env';
import { applicationModules } from '../registry/applications';
import ApplicationShell from '../layouts/ApplicationShell';
import CatalogPage from '../../features/catalog/pages/CatalogPage';
import ApplicationOverviewPage from '../../features/catalog/pages/ApplicationOverviewPage';
import { identityCapability } from '../../shared/capabilities/identity';

const registeredRoutes = applicationModules.map((application) => ({
  ...application,
  Component: lazy(application.load),
}));

const RouteLoading = () => (
  <div className="page-state" aria-label="页面加载中">
    <DotLoading color="primary" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const AppRouter = () => {
  const [sessionReady, setSessionReady] = useState(!appConfig.useMockApi);

  useEffect(() => {
    if (!appConfig.useMockApi) return;
    identityCapability.ensureDevelopmentUser()
      .catch(() => null)
      .finally(() => setSessionReady(true));
  }, []);

  if (!sessionReady) return <ApplicationShell><RouteLoading /></ApplicationShell>;

  return <BrowserRouter basename={appConfig.routerBaseName}>
    <ScrollToTop />
    <ApplicationShell>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/showcase/:applicationId" element={<ApplicationOverviewPage />} />
          {registeredRoutes.map(({ id, path, Component }) => (
            <Route key={id} path={`${path}/*`} element={<Component />} />
          ))}
          <Route path="*" element={<ErrorBlock status="empty" title="页面不存在" />} />
        </Routes>
      </Suspense>
    </ApplicationShell>
  </BrowserRouter>;
};

export default AppRouter;
