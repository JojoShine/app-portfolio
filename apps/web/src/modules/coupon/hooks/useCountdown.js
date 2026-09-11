import { useEffect, useState } from 'react';
export function useCountdown(expiresAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const deadline = typeof expiresAt === 'string' && !/^\d+$/.test(expiresAt) ? Date.parse(expiresAt) : Number(expiresAt);
  const total = Math.max(0, Math.ceil((deadline - now) / 1000) || 0);
  return { seconds: total, label: `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}` };
}
