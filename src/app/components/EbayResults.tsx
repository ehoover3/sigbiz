// src/app/components/EbayResults.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface EbayResultsProps {
  barcode: string;
}

interface EbayApiResponse {
  totalActiveListings?: number;
  items?: EbayItem[];
  error?: string;
  [key: string]: unknown; // allow extra fields
}

interface EbayItem {
  title: string;
  price: number;
  currency?: string;
  url?: string;
  [key: string]: unknown; // flexible for unexpected fields
}

const EbayResults: React.FC<EbayResultsProps> = ({ barcode }) => {
  const [data, setData] = useState<EbayApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barcode) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/backend/ebay?barcode=${barcode}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.error) setError(json.error);
        else setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barcode]);

  if (!barcode) return null;

  return (
    <div className='flex flex-col items-center space-y-2 w-full max-w-lg'>
      <p className='text-gray-700 text-sm'>Scanned Barcode: {barcode}</p>
      {loading && <p>Loading eBay results...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      {data && (
        <>
          {/* Example summary */}
          {data.totalActiveListings !== undefined && <p className='text-gray-800 font-semibold'>eBay Total Results: {data.totalActiveListings}</p>}

          {/* Full JSON rendered at bottom */}
          <div className='w-full mt-4 p-2 border rounded bg-gray-50 text-xs overflow-x-auto whitespace-pre-wrap'>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export default EbayResults;
