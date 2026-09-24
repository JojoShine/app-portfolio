import { useCallback, useEffect, useState } from 'react';
import { listReports, getReport } from '../services/report.service';
export default function useRecords(reportId, enabled = true) {
  const [items, setItems] = useState([]), [detail, setDetail] = useState(null);
  const [page, setPage] = useState(0), [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const load = useCallback(async (nextPage) => {
    setBusy(true); setError('');
    try {
      const result = await listReports(nextPage);
      setItems((current) => nextPage === 1 ? result.items : [...current, ...result.items]);
      setPage(nextPage); setTotal(result.total);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }, []);
  const open = useCallback(async (id) => {
    setBusy(true); setError('');
    try { setDetail(await getReport(id)); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => {
    setDetail(null);
    if (!enabled) return;
    let active = true;
    setBusy(true); setError('');
    const request = reportId ? getReport(reportId) : listReports(1);
    request.then((result) => {
      if (!active) return;
      if (reportId) setDetail(result);
      else { setItems(result.items); setPage(1); setTotal(result.total); }
    }).catch((failure) => { if (active) setError(failure.message); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [reportId, enabled]);
  return { items, detail, total, busy, error, more: () => load(page + 1), retry: () => reportId ? open(reportId) : load(1) };
}
