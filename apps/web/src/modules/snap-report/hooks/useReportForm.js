import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadPhoto, analyzePhotos } from '../services/photo.service';
import { submitReport } from '../services/report.service';
import { reverseLocation } from '../services/location.service';
import { emptyForm, mergeAnalysis, validateForm } from '../utils/report';

export default function useReportForm(user) {
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [analysis, setAnalysis] = useState({ status: 'idle' });
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const touched = useRef(new Set());
  const generation = useRef(0);
  const requestId = useRef(crypto.randomUUID());
  const urls = useRef(new Set());
  const submitLock = useRef(false);
  const lastOwner = useRef(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const reset = useCallback(() => {
    generation.current += 1;
    for (const url of urls.current) URL.revokeObjectURL(url);
    urls.current.clear(); touched.current.clear();
    setPhotos([]); setForm(emptyForm()); setAnalysis({ status: 'idle' }); setError(null); setReceipt(null);
    requestId.current = crypto.randomUUID();
  }, []);
  useEffect(() => {
    if (user && lastOwner.current && user.id !== lastOwner.current) reset();
    if (user) lastOwner.current = user.id;
  }, [user, reset]);
  useEffect(() => {
    const objectUrls = urls.current;
    return () => { generation.current += 1; for (const url of objectUrls) URL.revokeObjectURL(url); };
  }, []);
  const change = (key, value) => {
    touched.current.add(key);
    setForm((current) => ({ ...current, [key]: value,
      ...(key === 'address' ? { longitude: undefined, latitude: undefined, locationConfirmed: false } : {}) }));
    setError(null);
  };
  const upload = async (item) => {
    setPhotos((current) => current.map((photo) => photo.key === item.key ? { ...photo, status: 'uploading', error: '' } : photo));
    try {
      const result = await uploadPhoto(item.file);
      setPhotos((current) => current.map((photo) => photo.key === item.key ? { ...photo, id: result.id, status: 'ready' } : photo));
    } catch (failure) {
      setPhotos((current) => current.map((photo) => photo.key === item.key ? { ...photo, status: 'failed', error: failure.message } : photo));
    }
  };
  const addPhotos = (files) => {
    const selected = Array.from(files);
    if (!user || submitLock.current) return;
    if (selected.length + photosRef.current.length > 6) { setError({ field: 'photos', message: '每次最多上传6张照片' }); return; }
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024)) {
      setError({ field: 'photos', message: '请选择10MB以内的 JPG、PNG、WebP 或 GIF 照片' }); return;
    }
    if (!selected.length) return;
    generation.current += 1; setAnalysis({ status: 'idle' }); setError(null);
    setForm((current) => mergeAnalysis(current, {}, touched.current));
    const items = selected.map((file) => {
      const url = URL.createObjectURL(file); urls.current.add(url);
      return { key: crypto.randomUUID(), file, url, status: 'uploading' };
    });
    photosRef.current = [...photosRef.current, ...items];
    setPhotos(photosRef.current);
    items.forEach(upload);
  };
  const removePhoto = (key) => {
    generation.current += 1; setAnalysis({ status: 'idle' });
    setForm((current) => mergeAnalysis(current, {}, touched.current));
    setPhotos((current) => current.filter((photo) => photo.key !== key));
    setError(null);
  };
  const analyze = useCallback(async (fileIds) => {
    const version = ++generation.current;
    setAnalysis({ status: 'loading' });
    try {
      const result = await analyzePhotos(fileIds);
      if (version !== generation.current) return;
      setForm((current) => mergeAnalysis(current, result.result, touched.current));
      setAnalysis({ status: 'done', id: result.id, ...result.result });
    } catch (failure) {
      if (version === generation.current) setAnalysis({ status: 'failed', message: failure.message });
    }
  }, []);
  const signature = photos.length && photos.every((photo) => photo.status === 'ready') ? photos.map((photo) => photo.id).join(',') : '';
  useEffect(() => {
    if (signature && user?.id) analyze(signature.split(','));
  }, [signature, user?.id, analyze]);
  const setLocation = (value) => {
    setForm((current) => ({ ...current, ...value, locationConfirmed: true })); setError(null);
  };
  const locate = useCallback(() => {
    if (!navigator.geolocation) { setError({ field: 'address', message: '当前设备不支持定位，请手动选择位置' }); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await reverseLocation({ longitude: coords.longitude, latitude: coords.latitude, gps: true });
        setForm((current) => current.locationConfirmed || touched.current.has('address') ? current : { ...current, ...result, locationConfirmed: false });
      } catch (failure) { setError({ field: 'address', message: failure.message }); }
      finally { setLocating(false); }
    }, () => { setLocating(false); setError({ field: 'address', message: '未能获取位置，请手动填写发生位置' }); }, { enableHighAccuracy: true, timeout: 10000 });
  }, []);
  const locatedFor = useRef(null);
  useEffect(() => {
    if (user?.id && locatedFor.current !== user.id) { locatedFor.current = user.id; locate(); }
  }, [user?.id, locate]);
  const submit = async () => {
    if (!user || submitLock.current || analysis.status === 'loading') return;
    const issue = validateForm(form, photos);
    if (issue) {
      setError(issue);
      document.getElementById(`snap-${issue.field}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    submitLock.current = true; setSubmitting(true); setError(null);
    try {
      const result = await submitReport({ ...form, fileIds: photos.map((photo) => photo.id), analysisId: analysis.id || null, requestId: requestId.current });
      setReceipt(result); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (failure) { setError({ field: 'submit', message: failure.message }); }
    finally { submitLock.current = false; setSubmitting(false); }
  };
  return { form, photos, analysis, error, receipt, submitting, locating, change, addPhotos, removePhoto, retryPhoto: upload,
    retryAnalysis: () => signature && analyze(signature.split(',')), setLocation, locate, submit, reset,
    busy: submitting || analysis.status === 'loading' || photos.some((photo) => photo.status === 'uploading') };
}
