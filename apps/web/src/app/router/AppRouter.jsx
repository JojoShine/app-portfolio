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
  const [sessionReady, setSessionReady] = useState(!appConfig.useMockApi && !appConfig.publicDemo);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    if (!appConfig.useMockApi && !appConfig.publicDemo) return;
    const session = appConfig.publicDemo ? identityCapability.ensureLocalSession() : identityCapability.ensureDevelopmentUser();
    session.catch(error => { if (appConfig.publicDemo) setSessionError(error.message); })
      .finally(() => setSessionReady(true));
  }, []);

  if (!sessionReady) return <ApplicationShell><RouteLoading /></ApplicationShell>;
  if (sessionError) return <ApplicationShell><ErrorBlock title="演示登录暂不可用" description={sessionError} /><button type="button" onClick={() => window.location.reload()}>重新尝试</button></ApplicationShell>;

  return <BrowserRouter basename={appConfig.routerBaseName}>
    <ScrollToTop />
    <ApplicationShell>
      {appConfig.publicDemo && <div className="public-demo-notice" role="note">公共演示 · 测试账号数据共享，请勿提交真实信息或敏感材料</div>}
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
