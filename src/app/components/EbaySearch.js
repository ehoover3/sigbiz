// src/app/components/EbaySearch.js

"use client";

import { useState, useEffect } from "react";

export default function EbaySearch({ barcode = "", autoSearch = false }) {
  const [searchValue, setSearchValue] = useState(barcode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoSearch && barcode) {
      setSearchValue(barcode);
      handleSearch(barcode);
    }
  }, [barcode]);

  const handleSearch = async (code = searchValue) => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/ebay-search?barcode=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-4 w-full max-w-sm mx-auto'>
      <h1 className='text-xl sm:text-2xl font-bold mb-3'>eBay Barcode Search</h1>

      <div className='flex gap-2 mb-3'>
        <input type='text' placeholder='Enter barcode' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className='border p-2 rounded flex-1 text-sm sm:text-base' />
        <button onClick={() => handleSearch()} className='bg-blue-600 text-white px-3 py-2 rounded text-sm sm:text-base'>
          Search
        </button>
      </div>

      {loading && <p className='text-sm'>Loading...</p>}
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      {result && (
        <div className='mt-3 border p-3 rounded text-sm sm:text-base'>
          <h2 className='font-bold'>Results</h2>
          <p>Active Listings: {result.activeListings?.length || 0}</p>
          <p>Sold Listings: PLACEHOLDER</p>
          <p>Sell-Through Rate: PLACEHOLDER</p>

          {result.activeListings?.length > 0 && (
            <>
              <h3 className='mt-2 font-semibold'>Active Listings</h3>
              <ul className='space-y-1'>
                {result.activeListings.map((item) => (
                  <li key={item.itemId} className='border p-2 rounded truncate'>
                    <a href={item.itemWebUrl} target='_blank' rel='noopener noreferrer' className='truncate block'>
                      {item.title}
                    </a>
                    <p>
                      {item.price.value} {item.price.currency}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
