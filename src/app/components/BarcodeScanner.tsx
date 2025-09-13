"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

interface ScannedCode {
  code: string;
  timestamp: number;
}

const BarcodeScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([]);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [latestResult, setLatestResult] = useState<string>("");

  const DEBOUNCE_DELAY = 1500; // 1.5 seconds between scans

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls: IScannerControls | null = null;

    if (videoRef.current) {
      codeReader
        .decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result) {
              const scannedText = result.getText();
              const now = Date.now();

              // Debounce duplicate scans
              if (now - lastScanTime > DEBOUNCE_DELAY) {
                setLastScanTime(now);

                setScannedCodes((prev) => {
                  const alreadyScanned = prev.some((item) => item.code === scannedText);

                  if (!alreadyScanned) {
                    return [...prev, { code: scannedText, timestamp: now }];
                  }
                  return prev;
                });

                setLatestResult(scannedText);
              }
            }

            if (error && error.name !== "NotFoundException") {
              console.warn("Scan error:", error);
            }
          }
        )
        .then((ctrl) => {
          controls = ctrl;
        })
        .catch((err) => console.error("Camera initialization error:", err));
    }

    return () => {
      if (controls) {
        controls.stop(); // Stop camera when component unmounts
      }
    };
  }, [lastScanTime]);

  return (
    <div className='flex flex-col items-center p-4 w-full'>
      <h1 className='text-2xl font-bold mb-4'>Barcode Scanner</h1>

      {/* Video Container */}
      <div className='relative w-full max-w-md aspect-video border rounded-lg overflow-hidden'>
        {/* Camera Preview */}
        <video ref={videoRef} className='absolute inset-0 w-full h-full object-cover' autoPlay muted playsInline />

        {/* Centered Scan Box */}
        <div
          className='
            absolute inset-0 flex items-center justify-center
          '>
          <div
            className='
              relative w-3/4 h-32
              border-4 border-green-500 rounded-md
              shadow-lg
            '>
            {/* Optional corner styling */}
            <div className='absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500'></div>
            <div className='absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500'></div>
            <div className='absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500'></div>
            <div className='absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500'></div>
          </div>
        </div>
      </div>

      {/* Latest Scan Display */}
      {latestResult && (
        <div className='mt-4 p-4 border rounded-lg bg-green-100 text-green-900 w-full max-w-md text-center'>
          <strong>Latest Scanned Code:</strong> {latestResult}
        </div>
      )}

      {/* History of Scanned Codes */}
      {scannedCodes.length > 0 && (
        <div className='mt-6 w-full max-w-md'>
          <h2 className='text-lg font-semibold mb-2'>Scanned Codes</h2>
          <ul className='space-y-2'>
            {scannedCodes
              .slice()
              .reverse()
              .map((item) => (
                <li key={item.timestamp} className='p-2 border rounded-lg bg-gray-50 text-gray-800 flex justify-between items-center'>
                  <span>{item.code}</span>
                  <span className='text-xs text-gray-500'>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
