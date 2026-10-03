/**
 * QRScanner.jsx
 *
 * Two-mode QR reader for UPI payments:
 *   1. Camera scan  — live viewfinder via getUserMedia, decoded frame-by-frame
 *   2. Upload QR    — file picker, single frame decoded via canvas
 *
 * Props:
 *   onResult(text: string) — called with raw QR text once a code is found
 *   onClose()              — called when the user dismisses the scanner
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';

/* ── helpers ──────────────────────────────────────────── */

/** Decode a single ImageData with jsQR, trying both inversion modes. */
function decodeImageData(imageData) {
  for (const inv of ['dontInvert', 'attemptBoth', 'invertFirst']) {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: inv,
    });
    if (code) return code.data;
  }
  return null;
}

/**
 * Boost contrast on a canvas context's ImageData to help jsQR read
 * low-contrast / photographed QR codes.
 */
function boostContrast(ctx, w, h) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    // greyscale
    const grey = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // hard threshold → pure black/white
    const v = grey < 128 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Try to decode a QR from an image/video source.
 * Attempts: native size, 2× upscale, 4× upscale, center-crop 60 %, each with
 * a plain pass and a contrast-boosted pass — 8 attempts total.
 */
function decodeElement(source, naturalW, naturalH) {
  const attempts = [
    // [destW, destH, srcX, srcY, srcW, srcH]
    [naturalW,     naturalH,     0, 0, naturalW, naturalH],           // native
    [naturalW * 2, naturalH * 2, 0, 0, naturalW, naturalH],           // 2× up
    [naturalW * 4, naturalH * 4, 0, 0, naturalW, naturalH],           // 4× up
    // centre crop (inner 60 %)
    [naturalW,     naturalH,
      naturalW * 0.2, naturalH * 0.2,
      naturalW * 0.6, naturalH * 0.6],
    [naturalW * 2, naturalH * 2,
      naturalW * 0.2, naturalH * 0.2,
      naturalW * 0.6, naturalH * 0.6],
  ];

  for (const [dw, dh, sx, sy, sw, sh] of attempts) {
    const canvas = document.createElement('canvas');
    canvas.width  = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');

    // plain draw
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
    let result = decodeImageData(ctx.getImageData(0, 0, dw, dh));
    if (result) return result;

    // contrast-boosted draw
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
    boostContrast(ctx, dw, dh);
    result = decodeImageData(ctx.getImageData(0, 0, dw, dh));
    if (result) return result;
  }
  return null;
}

/* ── CameraScanner ────────────────────────────────────── */

function CameraScanner({ onResult, onClose }) {
  const videoRef  = useRef(null);
  const rafRef    = useRef(null);
  const streamRef = useRef(null);
  const [err, setErr] = useState('');
  const [scanning, setScanning] = useState(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setScanning(true);

        function tick() {
          if (!active) return;
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const text = decodeElement(video, video.videoWidth, video.videoHeight);
            if (text) { stop(); onResult(text); return; }
          }
          rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (!active) return;
        if (e.name === 'NotAllowedError') {
          setErr('Camera permission denied. Allow camera access in your browser settings, or use Upload QR instead.');
        } else if (e.name === 'NotFoundError') {
          setErr('No camera found on this device. Use Upload QR instead.');
        } else {
          setErr(`Camera error: ${e.message}`);
        }
      }
    }

    start();
    return () => { active = false; stop(); };
  }, [onResult, stop]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {err ? (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 p-3 text-sm w-full">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{err}</span>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {/* corner-bracket overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* top-left */}
              <span className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-sm" />
              {/* top-right */}
              <span className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-sm" />
              {/* bottom-left */}
              <span className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-sm" />
              {/* bottom-right */}
              <span className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-sm" />
            </div>
          </div>
          {scanning && (
            <p className="text-xs text-gray-500 animate-pulse">Point at a UPI QR code…</p>
          )}
        </>
      )}
      <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 underline mt-1">
        Cancel
      </button>
    </div>
  );
}

/* ── UploadScanner ────────────────────────────────────── */

function UploadScanner({ onResult, onClose }) {
  const inputRef = useRef(null);
  const [err, setErr]             = useState('');
  const [preview, setPreview]     = useState(null);
  const [scanning, setScanning]   = useState(false);

  function handleFile(event) {
    setErr('');
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setPreview(src);
      setScanning(true);
      const img = new Image();
      img.onload = () => {
        // run in a microtask so React can render the "Scanning…" state first
        setTimeout(() => {
          const text = decodeElement(img, img.naturalWidth, img.naturalHeight);
          setScanning(false);
          if (text) {
            onResult(text);
          } else {
            setErr(
              'No QR code detected. Tips: use a straight-on photo of just the QR, ' +
              'good lighting, and avoid photos of screens if possible.'
            );
          }
        }, 0);
      };
      img.onerror = () => { setScanning(false); setErr('Could not load the image.'); };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-xs text-gray-500 text-center">
        QR images are read on your device. No payment app is opened and no payment is sent.
      </p>

      {preview && (
        <img
          src={preview}
          alt="Selected QR"
          className="max-w-[180px] max-h-[180px] rounded-xl border border-gray-200 object-contain"
        />
      )}

      {scanning && (
        <p className="text-xs text-blue-600 animate-pulse">Scanning for QR code…</p>
      )}

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 p-3 text-sm w-full">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={scanning}
        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
      >
        <Upload size={15} />
        {scanning ? 'Scanning…' : preview ? 'Try another image' : 'Choose QR image'}
      </button>

      {/* hidden file input — images only */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        aria-label="Upload a QR code image"
      />

      <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 underline">
        Cancel
      </button>
    </div>
  );
}

/* ── QRScanner (top-level) ────────────────────────────── */

/**
 * @param {{ onResult: (text: string) => void, onClose: () => void }} props
 */
export default function QRScanner({ onResult, onClose }) {
  const [mode, setMode] = useState(null); // null | 'camera' | 'upload'

  if (mode === 'camera') {
    return <CameraScanner onResult={onResult} onClose={onClose} />;
  }
  if (mode === 'upload') {
    return <UploadScanner onResult={onResult} onClose={onClose} />;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-xs text-gray-500 text-center">
        QR images are read on your device. No payment app is opened and no payment is sent.<br />
        You can also enter the UPI ID below.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => setMode('camera')}
          className="btn-secondary flex items-center gap-2"
        >
          <Camera size={15} />
          Scan UPI QR
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className="btn-secondary flex items-center gap-2"
        >
          <Upload size={15} />
          Upload QR
        </button>
      </div>
      <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 underline text-center mt-1">
        Cancel
      </button>
    </div>
  );
}
