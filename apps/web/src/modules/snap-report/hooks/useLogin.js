import { useCallback, useEffect, useState } from 'react';
import useSessionStore from '../../../shared/auth/sessionStore';
import { identityCapability } from '../../../shared/capabilities/identity';

export default function useLogin() {
  const token = useSessionStore((state) => state.accessToken);
  const [ready, setReady] = useState(false), [user, setUser] = useState(null), [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    setReady(false); setError('');
    identityCapability.ensureLocalSession().then((current) => { if (active) setUser(current); })
      .catch((failure) => { if (active) { setUser(null); setError(failure.message); } })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [token, attempt]);
  return { ready, user, error, retry };
}
