import { useCallback, useEffect, useState } from 'react';
import { readAccount } from '../services/account.service';
export function useMall() {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  const reload = useCallback(async () => {
    try {
      setData(await readAccount());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    reload();
    const id = setInterval(reload, 30000);
    return () => clearInterval(id);
  }, [reload]);
  return {
    data,
    error,
    reload
  };
}
