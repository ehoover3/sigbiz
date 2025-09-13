"use client";
import { useState } from "react";

export default function EbaySearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/ebay-search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setItems(data.itemSummaries || []);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-4 max-w-lg mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>eBay Search</h1>

      <div className='flex gap-2 mb-4'>
        <input type='text' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search eBay items' className='border p-2 rounded flex-1' />
        <button onClick={handleSearch} className='bg-blue-600 text-white px-4 py-2 rounded'>
          Search
        </button>
      </div>

      {loading && <p className='text-gray-500'>Searching...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      <ul className='space-y-4 mt-4'>
        {items.map((item) => (
          <li key={item.itemId} className='border p-3 rounded'>
            <a href={item.itemWebUrl} target='_blank' rel='noopener noreferrer' className='font-semibold hover:underline'>
              {item.title}
            </a>
            <p className='text-sm text-gray-600'>
              Price: {item.price.value} {item.price.currency}
            </p>
            {item.image && <img src={item.image.imageUrl} alt={item.title} className='mt-2 w-32 rounded' />}
          </li>
        ))}
      </ul>
    </div>
  );
}
