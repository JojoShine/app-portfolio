import { useEffect, useState } from 'react';
import { identityCapability } from '../../shared/capabilities/identity';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  CategoryPage,
  EnrollmentHomePage,
  PreprocessPage,
  SchoolListPage,
  SchoolPolicyPage,
} from './pages/EnrollmentHomeFlow';
import {
  ApplicationOverviewPage,
  ClusterEditPage,
  ReviewSubmitPage,
  SubmitSuccessPage,
} from './pages/ApplicationFormFlow';
import {
  ApplicationDetailPage,
  ApplicationListPage,
  DistrictLookupPage,
  FaqPage,
  GuidePage,
  PoliciesPage,
  PropertyDegreeLookupPage,
  PublicQueryPage,
  SchedulePage,
} from './pages/PortalPages';
import { EnrollmentLayout } from './components/LayoutComponents';
import { portalService } from './services/portal.service';
import useEnrollmentStore from './store/enrollmentStore';
import './styles/index.css';

const EnrollmentApp = () => {
  const { pathname } = useLocation();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;
    identityCapability.ensureLocalSession()
      .then(() => portalService.getPortal())
      .then((portal) => {
        if (!active) return;
        if (!portal?.season) throw new Error('招生信息尚未配置');
        useEnrollmentStore.getState().setPortalData(portal);
        setSessionReady(true);
      }).catch((error) => { if (active) setSessionError(error.message); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const immersiveService = ['/enrollment/schedule', '/enrollment/policies', '/enrollment/faq', '/enrollment/district', '/enrollment/property-degree', '/enrollment/guide'].includes(pathname);
    const immersiveBlue = pathname === '/enrollment' || immersiveService || pathname.startsWith('/enrollment/public/');
    const immersiveCategory = pathname.startsWith('/enrollment/apply/');
    const color = immersiveBlue ? '#1267df' : immersiveCategory ? '#eaf4ff' : '#ffffff';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      ?.setAttribute('content', immersiveBlue ? 'black-translucent' : 'default');
  }, [pathname]);

  if (!sessionReady) return <EnrollmentLayout><div className="enrollment-page"><p role="status">{sessionError || '正在加载招生服务…'}</p></div></EnrollmentLayout>;

  return <EnrollmentLayout><Routes>
    <Route index element={<EnrollmentHomePage />} />
    <Route path="apply/:stageId" element={<CategoryPage />} />
    <Route path="schools" element={<SchoolListPage />} />
    <Route path="policy/:schoolId" element={<SchoolPolicyPage />} />
    <Route path="preprocess" element={<PreprocessPage />} />
    <Route path="overview" element={<ApplicationOverviewPage />} />
    <Route path="edit/:cluster" element={<ClusterEditPage />} />
    <Route path="review" element={<ReviewSubmitPage />} />
    <Route path="success" element={<SubmitSuccessPage />} />
    <Route path="applications" element={<ApplicationListPage />} />
    <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
    <Route path="schedule" element={<SchedulePage />} />
    <Route path="policies" element={<PoliciesPage />} />
    <Route path="faq" element={<FaqPage />} />
    <Route path="district" element={<DistrictLookupPage />} />
    <Route path="property-degree" element={<PropertyDegreeLookupPage />} />
    <Route path="guide" element={<GuidePage />} />
    <Route path="public/:type" element={<PublicQueryPage />} />
    <Route path="*" element={<Navigate to="/enrollment" replace />} />
  </Routes></EnrollmentLayout>;
};

export default EnrollmentApp;
