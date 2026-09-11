import { useCallback, useEffect, useRef, useState } from 'react';
import { readActivities } from '../services/activity.service';
export function useActivities() {
  const [data, setData] = useState(null), [error, setError] = useState('');
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const ticket = ++generation.current;
    try { const result = await readActivities(); if (ticket === generation.current) { setData(result); setError(''); } }
    catch (e) { if (ticket === generation.current) setError(e.message); }
  }, []);
  const update = useCallback(event => {
    generation.current += 1;
    setData(previous => previous && ({ ...previous, events: previous.events.map(e => e.id === event.id ? event : e) }));
    setError('');
  }, []);
  useEffect(() => {
    reload(); const timer = setInterval(reload, 5000);
    const onVisible = () => { if (!document.hidden) reload(); };
    document.addEventListener('visibilitychange', onVisible); window.addEventListener('storage', reload);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('storage', reload); };
  }, [reload]);
  return { data, error, reload, update };
}
