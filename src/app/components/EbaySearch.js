// src/app/components/EbaySearch.js
"use client";

import { useState, useEffect } from "react";

export default function EbaySearch({ barcode = "", autoSearch = false }) {
  const [searchValue, setSearchValue] = useState(barcode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    new: true,
    used: false,
    notSpecified: false,
  });
  const [proxyUrl, setProxyUrl] = useState("");
  const [ebayUrl, setEbayUrl] = useState("");

  // Generate eBay condition filter string (pipe-separated)
  const getConditionFilter = () => {
    const conditions = [];
    if (filters.new) conditions.push("1000");
    if (filters.used) conditions.push("1500");
    if (filters.notSpecified) conditions.push("3000");
    return conditions.length ? `conditionIds:${conditions.join("|")}` : "";
  };

  // Build actual eBay API URL (for display only)
  const buildEbayQueryUrl = (barcode, conditionFilter) => {
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    if (barcode) url.searchParams.append("barcode", barcode);
    if (conditionFilter) url.searchParams.append("filter", conditionFilter);
    return url.toString();
  };

  // Perform search
  const handleSearch = async (code = searchValue) => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const conditionFilter = getConditionFilter();

      // Build proxy URL (frontend → API route)
      const params = new URLSearchParams({ barcode: code });
      if (conditionFilter) params.append("conditionFilter", conditionFilter);
      const proxyFullUrl = `/api/ebay?${params.toString()}`;
      setProxyUrl(proxyFullUrl);

      // Build eBay API URL (for display only)
      setEbayUrl(buildEbayQueryUrl(code, conditionFilter));

      const res = await fetch(proxyFullUrl);
      const data = await res.json();

      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Auto search when barcode changes
  useEffect(() => {
    if (autoSearch && barcode) {
      setSearchValue(barcode);
      handleSearch(barcode);
    }
  }, [barcode]);

  // Trigger search automatically when filters change
  useEffect(() => {
    if (searchValue.trim()) handleSearch();
  }, [filters]);

  // Handle checkbox changes
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
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

      <div className='mb-3'>
        <label className='mr-2 font-semibold'>Condition:</label>
        <label className='ml-2'>
          <input type='checkbox' name='new' checked={filters.new} onChange={handleFilterChange} /> New
        </label>
        <label className='ml-2'>
          <input type='checkbox' name='used' checked={filters.used} onChange={handleFilterChange} /> Used
        </label>
        <label className='ml-2'>
          <input type='checkbox' name='notSpecified' checked={filters.notSpecified} onChange={handleFilterChange} /> Not Specified
        </label>
      </div>

      {proxyUrl && (
        <p className='text-xs text-gray-500 break-words mb-1'>
          <strong>Proxy URL:</strong>
          <br /> {decodeURIComponent(proxyUrl)}
        </p>
      )}
      {ebayUrl && (
        <p className='text-xs text-gray-500 break-words mb-2'>
          <strong>eBay API URL:</strong>
          <br /> {ebayUrl}
        </p>
      )}

      {loading && <p className='text-sm'>Loading...</p>}
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      {result && (
        <div className='mt-3 border p-3 rounded text-sm sm:text-base'>
          <h2 className='font-bold'>Results</h2>
          <p>Active Listings: {result.activeListings?.length || 0}</p>
          <p>Sold Listings: PLACEHOLDER</p>
          <p>Sell-Through Rate: PLACEHOLDER</p>

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
        </div>
      )}
    </div>
  );
}
