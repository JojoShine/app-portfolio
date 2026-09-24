import { useCallback, useEffect, useRef, useState } from 'react';
import { reverseLocation, searchLocations } from '../services/location.service';

let mapLoader;
const loadMap = () => {
  if (window.AMap) return Promise.resolve(window.AMap);
  const key = import.meta.env.VITE_AMAP_JS_KEY;
  if (!key) return Promise.reject(new Error('地图暂不可用，可直接填写发生地址。'));
  if (!mapLoader) mapLoader = new Promise((resolve, reject) => {
    window._AMapSecurityConfig = { securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE || '' };
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    const timer = setTimeout(() => reject(new Error('地图加载超时，请手动填写地址')), 10000);
    script.onload = () => { clearTimeout(timer); window.AMap ? resolve(window.AMap) : reject(new Error('地图加载失败')); };
    script.onerror = () => { clearTimeout(timer); reject(new Error('地图加载失败，请手动填写地址')); };
    document.head.appendChild(script);
  }).catch((error) => { mapLoader = null; throw error; });
  return mapLoader;
};

export default function useLocationPicker(initial) {
  const [value, setValue] = useState({ address: initial.address || '', detail: initial.detail || '', longitude: initial.longitude, latitude: initial.latitude });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mapError, setMapError] = useState('');
  const [node, setNode] = useState(null);
  const map = useRef(null), marker = useRef(null), sequence = useRef(0);
  const select = useCallback((item) => {
    setValue((current) => ({ ...current, ...item }));
    if (map.current && item.longitude != null) {
      map.current.setCenter([item.longitude, item.latitude]);
      marker.current?.setPosition([item.longitude, item.latitude]);
    }
  }, []);
  const reverse = useCallback(async (point) => {
    const version = ++sequence.current;
    setBusy(true); setError('');
    try { const result = await reverseLocation(point); if (version === sequence.current) select(result); }
    catch (failure) { if (version === sequence.current) setError(failure.message); }
    finally { if (version === sequence.current) setBusy(false); }
  }, [select]);
  useEffect(() => {
    if (!node) return;
    let active = true;
    loadMap().then((AMap) => {
      if (!active) return;
      const center = initial.longitude != null ? [initial.longitude, initial.latitude] : [120.467, 32.533];
      map.current = new AMap.Map(node, { zoom: 15, center });
      marker.current = new AMap.Marker({ position: center, map: map.current });
      map.current.on('click', (event) => reverse({ longitude: event.lnglat.getLng(), latitude: event.lnglat.getLat() }));
    }).catch((failure) => { if (active) setMapError(failure.message); });
    return () => { active = false; sequence.current += 1; map.current?.destroy(); map.current = null; };
  }, [node, initial.longitude, initial.latitude, reverse]);
  const locate = () => {
    if (!navigator.geolocation) { setError('设备不支持定位，请手动填写'); return; }
    const version = ++sequence.current;
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (version === sequence.current) reverse({ longitude: coords.longitude, latitude: coords.latitude, gps: true });
    }, () => {
      if (version === sequence.current) { setBusy(false); setError('定位失败，请手动填写地址'); }
    }, { timeout: 10000, enableHighAccuracy: true });
  };
  const search = async () => {
    if (!query.trim()) return;
    const version = ++sequence.current;
    setBusy(true); setError('');
    try {
      const items = await searchLocations(query);
      if (version === sequence.current) { setResults(items); if (!items.length) setError('没有找到海安市内匹配地址，可手动填写'); }
    } catch (failure) { if (version === sequence.current) setError(failure.message); }
    finally { if (version === sequence.current) setBusy(false); }
  };
  return { value, query, setQuery, results, error, setError, busy, mapError, setNode, locate, search, select,
    edit: (key, text) => { sequence.current += 1; setBusy(false); setError(''); setValue((current) => ({ ...current, [key]: text, ...(key === 'address' ? { longitude: undefined, latitude: undefined } : {}) })); },
  };
}
