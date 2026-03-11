import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatOneDReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';

// ─── BarcodeDetector native API (Chrome Android) ──────────────────────────
interface NativeBarcode { rawValue: string; format: string; }
interface BarcodeDetectorLike {
  detect(src: HTMLVideoElement | HTMLCanvasElement): Promise<NativeBarcode[]>;
}
declare const BarcodeDetector: {
  new(opts?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?(): Promise<string[]>;
};
const HAS_NATIVE = typeof window !== 'undefined' && 'BarcodeDetector' in window;

// ─── zxing fallback ────────────────────────────────────────────────────────
const HINTS = new Map<DecodeHintType, unknown>([
  [DecodeHintType.POSSIBLE_FORMATS,
    [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.EAN_13,
     BarcodeFormat.EAN_8, BarcodeFormat.ITF]],
  [DecodeHintType.TRY_HARDER, true],
]);

// ─── Camera constraints ────────────────────────────────────────────────────
const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },
    width:  { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
interface BarcodeScannerProps { onScan: (value: string) => void; }

const isTouch =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const canLiveScan =
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

const trimLeadingZeros = (v: string) => v.replace(/^0+/, '') || '0';
const vibrate = () => { try { navigator.vibrate?.(120); } catch { /* noop */ } };

// Compute the crop rect in video-pixel space for the finder overlay element.
// The video is rendered with object-fit:cover, so we account for the scale + offset.
function getCropRect(finder: HTMLDivElement, video: HTMLVideoElement) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const videoW = video.videoWidth;
  const videoH = video.videoHeight;
  if (!videoW || !videoH) return null;

  const scale = Math.max(vw / videoW, vh / videoH);
  const renderedW = videoW * scale;
  const renderedH = videoH * scale;
  const offsetX = (renderedW - vw) / 2;
  const offsetY = (renderedH - vh) / 2;

  const r = finder.getBoundingClientRect();
  const sx = Math.max(0, (r.left + offsetX) / scale);
  const sy = Math.max(0, (r.top  + offsetY) / scale);
  const sw = Math.min(r.width  / scale, videoW - sx);
  const sh = Math.min(r.height / scale, videoH - sy);
  return { sx, sy, sw: Math.round(sw), sh: Math.round(sh) };
}

// ──────────────────────────────────────────────────────────────────────────
function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [open, setOpen]             = useState(false);
  const [torch, setTorch]           = useState(false);
  const [error, setError]           = useState('');
  const [processing, setProcessing] = useState(false);

  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const finderRef     = useRef<HTMLDivElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const cancelledRef  = useRef(false);
  const zxingCtrlRef  = useRef<{ stop: () => void } | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  // ── Open / close camera ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !canLiveScan) return;

    cancelledRef.current = false;

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      if (cancelledRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      if (HAS_NATIVE) runNativeScan(video);
      else            runZxingScan(video);
    };

    startCamera().catch(err => {
      if (cancelledRef.current) return;
      setError(err instanceof Error ? err.message : 'לא ניתן לגשת למצלמה');
      setOpen(false);
    });

    return () => {
      cancelledRef.current = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      zxingCtrlRef.current?.stop();
      zxingCtrlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Draw cropped frame to hidden canvas ───────────────────────────────────
  const drawCrop = useCallback((video: HTMLVideoElement): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    const finder = finderRef.current;
    if (!canvas || !finder) return null;
    const crop = getCropRect(finder, video);
    if (!crop) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width  = crop.sw;
    canvas.height = crop.sh;
    ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);
    return canvas;
  }, []);

  // ── Draw full frame to second hidden canvas ────────────────────────────────
  const drawFull = useCallback((video: HTMLVideoElement): HTMLCanvasElement | null => {
    const canvas = fullCanvasRef.current;
    if (!canvas || !video.videoWidth || !video.videoHeight) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas;
  }, []);

  // ── Native BarcodeDetector loop ──────────────────────────────────────────
  const runNativeScan = useCallback((video: HTMLVideoElement) => {
    const detector = new BarcodeDetector({
      formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'codabar', 'itf'],
    });

    const tick = async () => {
      if (cancelledRef.current) return;
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        const sources = [drawCrop(video) ?? video, drawFull(video) ?? video];
        for (const src of sources) {
          try {
            const results = await detector.detect(src);
            if (results.length > 0 && !cancelledRef.current) {
              streamRef.current?.getTracks().forEach(t => t.stop());
              vibrate();
              onScan(trimLeadingZeros(results[0].rawValue));
              setOpen(false);
              setTorch(false);
              return;
            }
          } catch { /* no barcode in this source */ }
        }
      }
      if (!cancelledRef.current) setTimeout(tick, 80);
    };
    tick();
  }, [onScan, drawCrop, drawFull]);

  // ── zxing fallback loop (canvas-based crop) ───────────────────────────────
  const runZxingScan = useCallback((video: HTMLVideoElement) => {
    const reader = new BrowserMultiFormatOneDReader(HINTS, { delayBetweenScanAttempts: 50 });
    let active = true;
    zxingCtrlRef.current = { stop: () => { active = false; } };

    const tryDecode = (canvas: HTMLCanvasElement) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (reader as any).decodeFromCanvas(canvas) ?? null;
      } catch (err) {
        if (!(err instanceof NotFoundException)) console.debug('zxing', err);
        return null;
      }
    };

    const tick = () => {
      if (!active || cancelledRef.current) return;
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        const crop = drawCrop(video);
        const full = drawFull(video);
        const result = (crop && tryDecode(crop)) || (full && tryDecode(full));
        if (result && !cancelledRef.current) {
          active = false;
          streamRef.current?.getTracks().forEach(t => t.stop());
          vibrate();
          onScan(trimLeadingZeros(result.getText()));
          setOpen(false);
          setTorch(false);
          return;
        }
      }
      if (!cancelledRef.current && active) setTimeout(tick, 100);
    };
    tick();
  }, [onScan, drawCrop, drawFull]);

  // ── Torch toggle ─────────────────────────────────────────────────────────
  useEffect(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.applyConstraints({ advanced: [{ torch } as MediaTrackConstraintSet] }).catch(() => {});
  }, [torch]);

  const close = useCallback(() => {
    cancelledRef.current = true;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    zxingCtrlRef.current?.stop();
    zxingCtrlRef.current = null;
    setOpen(false);
    setTorch(false);
    setError('');
  }, []);

  // ── File fallback (HTTP / no getUserMedia) ────────────────────────────────
  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    const url = URL.createObjectURL(file);
    try {
      const reader = new BrowserMultiFormatOneDReader(HINTS, { delayBetweenScanAttempts: 50 });
      const result = await reader.decodeFromImageUrl(url);
      vibrate();
      onScan(trimLeadingZeros(result.getText()));
      setError('');
    } catch {
      setError('לא נמצא ברקוד — נסה שוב');
    } finally {
      URL.revokeObjectURL(url);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setProcessing(false);
    }
  };

  if (!isTouch) return null;

  const openScanner = () => {
    setError('');
    if (canLiveScan) setOpen(true);
    else fileInputRef.current?.click();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }} onChange={handleFileCapture} />

      <div className="barcode-scanner">
        <button
          className={`barcode-scanner__btn${processing ? ' barcode-scanner__btn--loading' : ''}`}
          onClick={openScanner} disabled={processing}
        >
          {processing ? (
            <><span className="barcode-scanner__pulse" />מעבד...</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5v2" /><path d="M3 10v2" /><path d="M3 15v2" />
                <path d="M7 3h2" /><path d="M12 3h2" /><path d="M17 3h2" />
                <path d="M21 5v2" /><path d="M21 10v2" /><path d="M21 15v2" />
                <path d="M7 21h2" /><path d="M12 21h2" /><path d="M17 21h2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
              סרוק ברקוד
            </>
          )}
        </button>
        {error && <div className="barcode-scanner__error">{error}</div>}
      </div>

      {open && (
        <div className="bs-modal">
          <div className="bs-modal__topbar">
            <button className="bs-modal__back" onClick={close}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="bs-modal__title">סרוק ברקוד</span>
            <button className={`bs-modal__torch${torch ? ' bs-modal__torch--on' : ''}`}
              onClick={() => setTorch(t => !t)} aria-label="פנס">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8l1 6H7L8 2z" />
                <path d="M7 8l2 14h6l2-14" />
                <line x1="12" y1="12" x2="12" y2="18" />
              </svg>
            </button>
          </div>

          <video ref={videoRef} className="bs-modal__video" playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <canvas ref={fullCanvasRef} style={{ display: 'none' }} />

          {/* Viewfinder — wide rectangle optimised for barcodes */}
          <div ref={finderRef} className="bs-modal__finder-box">
            <span className="bs-modal__corner bs-modal__corner--tl" />
            <span className="bs-modal__corner bs-modal__corner--tr" />
            <span className="bs-modal__corner bs-modal__corner--bl" />
            <span className="bs-modal__corner bs-modal__corner--br" />
            <div className="bs-modal__scan-line" />
          </div>

          <div className="bs-modal__bottom">
            <p className="bs-modal__hint">
              {HAS_NATIVE ? 'כוון את הברקוד אל תוך המסגרת' : 'כוון את הברקוד אל תוך המסגרת (מצב ידני)'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default BarcodeScanner;
