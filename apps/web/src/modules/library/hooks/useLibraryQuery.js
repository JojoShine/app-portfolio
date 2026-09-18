import { useCallback, useEffect, useState } from 'react';

export default function useLibraryQuery(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try { setData(await loader()); setError(''); }
    catch (requestError) { setError(requestError.message || '加载失败'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}
