import { useEffect } from 'react';
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
import './enrollment.css';

const EnrollmentApp = () => {
  const { pathname } = useLocation();

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

  return <Routes>
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
  </Routes>;
};

export default EnrollmentApp;
