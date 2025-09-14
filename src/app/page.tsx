// src/app/page.tsx
"use client";

import React, { useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import EbayResults from "./components/EbayResults";

const App: React.FC = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string>("");

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 space-y-6 md:space-y-8 border border-gray-200 rounded-lg'>
      <BarcodeScanner onScan={(code: string) => setScannedBarcode(code)} />
      <EbayResults barcode={scannedBarcode} />
    </div>
  );
};

export default App;
