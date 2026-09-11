import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
export function useQrScanner(onCode) {
  const video = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);
  const callback = useRef(onCode);
  const alive = useRef(true);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [torch, setTorch] = useState(false);
  callback.current = onCode;
  const stop = useCallback(() => { clearTimeout(timer.current); stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; }, []);
  useEffect(() => { alive.current = true; return () => { alive.current = false; stop(); }; }, [stop]);
  const read = (source, width, height) => {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 900 / Math.max(width, height));
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(pixels.data, pixels.width, pixels.height)?.data;
  };
  const accept = (code) => { if (!/^\d{8}$/.test(code || '')) { setError('请扫描消费券的8位动态核销码'); return false; } stop(); setStatus('done'); callback.current(code); return true; };
  async function start() {
    stop(); setError(''); setStatus('requesting');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('当前浏览器不支持摄像头，请从相册选择或手输券码');
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (!alive.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media; video.current.srcObject = media; await video.current.play(); setStatus('scanning');
      const scan = () => {
        if (!alive.current || !stream.current) return;
        if (video.current?.readyState >= 2) { const code = read(video.current, video.current.videoWidth, video.current.videoHeight); if (code && accept(code)) return; }
        timer.current = setTimeout(scan, 220);
      };
      scan();
    } catch (error) { stop(); if (alive.current) { setStatus('error'); setError(error.name === 'NotAllowedError' ? '摄像头权限未开启，请在浏览器设置中允许使用摄像头后重试' : error.message); } }
  }
  async function readFile(file) {
    if (!file) return;
    setError('');
    try { const bitmap = await createImageBitmap(file); const code = read(bitmap, bitmap.width, bitmap.height); bitmap.close(); if (!code) throw new Error('未识别到二维码，请选择清晰的消费券二维码'); accept(code); }
    catch (error) { setError(error.message); }
  }
  async function toggleTorch() {
    const track = stream.current?.getVideoTracks()[0];
    try { if (!track || !track.getCapabilities?.().torch) throw new Error('当前设备不支持手电筒，请使用相册或手输券码'); await track.applyConstraints({ advanced: [{ torch: !torch }] }); setTorch(!torch); }
    catch (error) { setError(error.message); }
  }
  return { video, status, error, torch, start, readFile, toggleTorch };
}
