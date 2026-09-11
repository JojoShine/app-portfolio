import { useCallback, useEffect, useRef, useState } from 'react';
export function useCouponData(loader) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const previousLoader = useRef(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    const changed = previousLoader.current !== loader;
    previousLoader.current = loader;
    setState((current) => changed ? { data: null, error: '', loading: true } : { ...current, error: '', loading: !current.data });
    loader().then((data) => { if (active) setState({ data, error: '', loading: false }); })
      .catch((error) => { if (active) setState({ data: null, error: error.message, loading: false }); });
    return () => { active = false; };
  }, [loader, revision]);
  return { ...state, reload };
}
