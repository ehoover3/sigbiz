// src/app/components/BarcodeScanner.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

interface ScannedCode {
  code: string;
  timestamp: number;
}

interface BarcodeScannerProps {
  onScan?: (code: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([]);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [latestResult, setLatestResult] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const DEBOUNCE_DELAY = 1500;

  const handleManualSubmit = () => {
    const code = manualInput.trim();
    if (!code) return;

    const now = Date.now();
    setScannedCodes((prev) => {
      if (!prev.some((item) => item.code === code)) {
        return [...prev, { code, timestamp: now }];
      }
      return prev;
    });

    setLatestResult(code);
    if (onScan) onScan(code);
    setManualInput("");
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls: IScannerControls | null = null;

    if (videoRef.current) {
      codeReader
        .decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const scannedText = result.getText();
            const now = Date.now();
            if (now - lastScanTime > DEBOUNCE_DELAY) {
              setLastScanTime(now);
              setScannedCodes((prev) => {
                if (!prev.some((item) => item.code === scannedText)) {
                  return [...prev, { code: scannedText, timestamp: now }];
                }
                return prev;
              });
              setLatestResult(scannedText);
              if (onScan) onScan(scannedText);
            }
          }
          if (error && error.name !== "NotFoundException") {
            console.warn("Scan error:", error);
          }
        })
        .then((ctrl) => {
          controls = ctrl;
        })
        .catch((err) => console.error("Camera initialization error:", err));
    }

    return () => controls?.stop();
  }, [lastScanTime, onScan]);

  return (
    <div className='flex flex-col items-center w-full max-w-sm mx-auto'>
      <h1 className='text-xl sm:text-2xl font-bold mb-3'>Barcode Scanner</h1>

      {/* Video Scanner */}
      <div className='relative w-full aspect-video border rounded-lg overflow-hidden'>
        <video ref={videoRef} className='absolute inset-0 w-full h-full object-cover transform scale-x-[-1]' autoPlay muted playsInline />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='relative w-3/4 h-32 border-4 border-green-500 rounded-md shadow-lg'>
            <div className='absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-green-500'></div>
            <div className='absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-green-500'></div>
            <div className='absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-green-500'></div>
            <div className='absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-green-500'></div>
          </div>
        </div>
      </div>

      {/* Manual Input */}
      <div className='mt-4 w-full flex gap-2'>
        <input type='text' value={manualInput} onChange={(e) => setManualInput(e.target.value)} placeholder='Enter barcode manually' className='flex-1 p-2 border rounded-lg' onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()} />
        <button onClick={handleManualSubmit} className='px-4 py-2 bg-green-500 text-white rounded-lg'>
          Add
        </button>
      </div>

      {/* Latest Result */}
      {latestResult && (
        <div className='mt-3 p-3 border rounded-lg bg-green-100 text-green-900 w-full text-center text-sm sm:text-base'>
          <strong>Latest Scanned Code:</strong> {latestResult}
        </div>
      )}

      {/* Scanned Codes List */}
      {scannedCodes.length > 0 && (
        <div className='mt-4 w-full'>
          <h2 className='text-lg font-semibold mb-2'>Scanned Codes</h2>
          <ul className='space-y-1 max-h-40 overflow-y-auto'>
            {scannedCodes
              .slice()
              .reverse()
              .map((item) => (
                <li key={item.timestamp} className='p-2 border rounded-lg bg-gray-50 text-gray-800 flex justify-between items-center text-xs sm:text-sm'>
                  <span className='truncate'>{item.code}</span>
                  <span className='text-gray-500'>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
