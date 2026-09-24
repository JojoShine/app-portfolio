import { useEffect, useState } from 'react';
import { fileCapability } from '../../../shared/capabilities/files';
import useEnrollmentStore from '../store/enrollmentStore';

export const useMaterialFiles = (itemCode) => {
  const materials = useEnrollmentStore((state) => state.serverMaterials);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const urls = [];
    Promise.all(materials.filter((item) => item.itemCode === itemCode).map(async (item) => {
      const url = await fileCapability.createObjectUrl(item.fileId || item.file?.id);
      if (!active) fileCapability.releaseObjectUrl(url);
      else urls.push(url);
      return { url, materialId: item.id };
    })).then((items) => {
      if (active) { setFiles(items); setError(''); }
    }).catch((failure) => { if (active) setError(failure.message || '附件加载失败'); });
    return () => { active = false; urls.forEach(fileCapability.releaseObjectUrl); };
  }, [materials, itemCode]);
  return { files, error };
};
