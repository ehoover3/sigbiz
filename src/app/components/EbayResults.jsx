import React, { useEffect, useState } from "react";

const EbayResults = ({ barcode }) => {
  const [totalResults, setTotalResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!barcode) return;

    setLoading(true);
    setError(null);

    fetch(`/backend/ebay?barcode=${barcode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTotalResults(data.totalResults);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [barcode]);

  if (!barcode) return null;

  return (
    <div className='flex flex-col items-center space-y-2'>
      <p className='text-gray-700 text-sm'>Scanned Barcode: {barcode}</p>
      {loading && <p>Loading eBay results...</p>}
      {error && <p className='text-red-500'>{error}</p>}
      {totalResults !== null && <p className='text-gray-800 font-semibold'>eBay Total Results: {totalResults}</p>}
    </div>
  );
};

export default EbayResults;
