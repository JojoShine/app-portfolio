import { useEffect, useState } from 'react';
import { getSeatAvailability } from '../services/library.service';

export default function useSeatAvailability({ branchId, startsAt, endsAt, revision }) {
  const requestKey = `${branchId}|${startsAt}|${endsAt}|${revision}`;
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!branchId) return undefined;
    let active = true;
    getSeatAvailability({ branchId, startsAt, endsAt }).then((data) => {
      if (active) setResult({ key: requestKey, data, error: '' });
    }).catch((error) => {
      if (active) setResult({ key: requestKey, data: [], error: error.message || '座位加载失败' });
    });
    return () => { active = false; };
  }, [branchId, startsAt, endsAt, requestKey]);

  const current = result?.key === requestKey ? result : null;
  return {
    requestKey,
    data: current?.data || [],
    error: current?.error || '',
    loading: Boolean(branchId) && !current,
  };
}
