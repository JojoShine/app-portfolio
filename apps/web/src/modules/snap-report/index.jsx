import ReportPage from './pages/ReportPage';
import RecordsPage from './pages/RecordsPage';
import { Navigate, Route, Routes, useMatch } from 'react-router-dom';
import './snap-report.css';
export default function SnapReportApp() {
  const reporting = useMatch('/snap-report');
  return <>
    <div hidden={!reporting}><ReportPage /></div>
    <Routes>
      <Route index element={null} />
      <Route path="records" element={<RecordsPage />} />
      <Route path="records/:reportId" element={<RecordsPage />} />
      <Route path="*" element={<Navigate to="/snap-report" replace />} />
    </Routes>
  </>;
}
