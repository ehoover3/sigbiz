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

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [name]: checked };
      return updatedFilters;
    });
  };

  const getConditionFilter = () => {
    const conditions = [];
    if (filters.new) conditions.push("1000");
    if (filters.used) conditions.push("1500");
    if (filters.notSpecified) conditions.push("3000");
    return conditions.length ? `conditionIds:{${conditions.join(",")}}` : "";
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
        <label className='mr-2'>Condition:</label>
        <label>
          <input type='checkbox' name='new' checked={filters.new} onChange={handleFilterChange} />
          New
        </label>
        <label className='ml-2'>
          <input type='checkbox' name='used' checked={filters.used} onChange={handleFilterChange} />
          Used
        </label>
        <label className='ml-2'>
          <input type='checkbox' name='notSpecified' checked={filters.notSpecified} onChange={handleFilterChange} />
          Not Specified
        </label>
      </div>

      {loading && <p className='text-sm'>Loading...</p>}
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      {result && (
        <div className='mt-3 border p-3 rounded text-sm sm:text-base'>
          <h2 className='font-bold'>Results</h2>

          {/* Active Listings count */}
          <p>Active Listings: {result.activeListings?.length || 0}</p>

          {/* Placeholders */}
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
