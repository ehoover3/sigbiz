import React from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import EbaySearch from "./components/EbaySearch";

const App: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <BarcodeScanner />
      <EbaySearch />
    </div>
  );
};

export default App;
