import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getCredential } from '../services/verification.service';
export function useCredential(id, enabled) {
  const [state, setState] = useState({ code: '', qr: '', expiresAt: 0, error: '', loading: false });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let timer;
    setState({ code: '', qr: '', expiresAt: 0, error: '', loading: true });
    getCredential(id).then(async (credential) => {
      const qr = await QRCode.toDataURL(credential.code, { margin: 0, width: 320, color: { dark: '#10212b', light: '#fffdf8' } });
      if (!active) return;
      setState({ ...credential, qr, error: '', loading: false });
      timer = setTimeout(refresh, Math.max(100, credential.expiresAt - Date.now()));
    }).catch((error) => { if (active) setState({ code: '', qr: '', expiresAt: 0, error: error.message, loading: false }); });
    return () => { active = false; clearTimeout(timer); };
  }, [id, enabled, revision, refresh]);
  return { ...state, refresh };
}
