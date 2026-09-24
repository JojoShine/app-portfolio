import { useEffect, useState } from 'react';
import { portalService } from '../services/portal.service';

export const useContacts = (visible) => {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    portalService.getContacts().then((items) => {
      if (active) { setContacts(items); setError(''); }
    }).catch((failure) => { if (active) setError(failure.message || '咨询电话加载失败'); });
    return () => { active = false; };
  }, [visible]);
  return { contacts, error };
};
