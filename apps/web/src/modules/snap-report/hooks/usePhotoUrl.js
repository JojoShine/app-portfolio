import { useEffect, useState } from 'react';
import { photoBlob } from '../services/photo.service';
export default function usePhotoUrl(id) {
  const [url, setUrl] = useState(''), [error, setError] = useState(false);
  useEffect(() => {
    let active = true, objectUrl;
    setUrl(''); setError(false);
    photoBlob(id).then((blob) => {
      if (active) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  return { url, error };
}
