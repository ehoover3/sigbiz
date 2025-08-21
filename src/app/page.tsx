"use client";
import { useState } from "react";
import fitness from "../../data/products/fitness.json";
import music from "../../data/products/music.json";
const products = [...fitness, ...music];

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(products.map((item) => item.category))];

  const filteredProducts = products.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <main className='p-4 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4 text-center'>Buy Low, Sell High</h1>

      {/* Product list */}
      <div className='overflow-y-auto mb-44' style={{ maxHeight: "calc(100vh - 16rem)", paddingBottom: "2rem" }}>
        <ul className='space-y-4'>
          {filteredProducts.map((item) => (
            <li key={item.id} className='p-4 border rounded-lg shadow'>
              <h2 className='text-lg font-semibold mb-1'>
                {item.emoji} {item.name}
              </h2>
              <p className='text-sm mb-1'>Category: {item.category}</p>
              <p className='text-sm mb-1'>Brands: {item.brands.join(", ")}</p>
              <p className='text-sm mb-1'>Buy Price: ${item.buyPrice}</p>
              <p className='text-sm mb-1'>Sell Price: ${item.sellPrice}</p>
              {item.qualityChecklist && <p className='text-sm mb-1'>Quality Check: {item.qualityCheck}</p>}
              {item.notes && <p className='text-sm mb-1'>Notes: {item.notes}</p>}
              <p className='font-bold text-green-600 mt-1'>Profit: ${item.sellPrice - item.buyPrice}</p>
            </li>
          ))}
          {filteredProducts.length === 0 && <p className='text-gray-500 text-center'>No products found.</p>}
        </ul>
      </div>

      {/* Filters */}
      <div className='fixed bottom-16 left-0 w-full bg-black z-10 p-4 border-t shadow-inner'>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className='border p-3 rounded w-full text-base mb-3'>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input type='text' placeholder='Search products...' value={query} onChange={(e) => setQuery(e.target.value)} className='border p-3 rounded w-full text-base' />
      </div>

      {/* Navigation */}
      <nav className='fixed bottom-0 left-0 w-full bg-black border-t shadow-inner flex justify-around py-2'>
        <button className='flex flex-col items-center text-sm text-blue-600'>
          <span>🏠</span>
          Home
        </button>
        <button className='flex flex-col items-center text-sm text-gray-600'>
          <span>📷</span>
          Scan
        </button>
        <button className='flex flex-col items-center text-sm text-gray-600'>
          <span>🕒</span>
          History
        </button>
        <button className='flex flex-col items-center text-sm text-gray-600'>
          <span>⚠️</span>
          Alerts
        </button>
      </nav>
    </main>
  );
}
