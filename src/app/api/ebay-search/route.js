// src/app/api/ebay-search/route.js
import { getEbayToken, searchActiveListings, searchSoldListings } from "../../lib/ebay";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get("barcode");

  if (!barcode) {
    return new Response(JSON.stringify({ error: "Barcode is required" }), {
      status: 400,
    });
  }

  try {
    // 1. Get Active Listings
    const token = await getEbayToken();
    const activeData = await searchActiveListings(token, barcode);

    // Use total count from Browse API if available
    const numActive = activeData.total || (activeData.itemSummaries?.length ?? 0);
    const activeListings = activeData.itemSummaries || [];

    // 2. Get Sold Listings
    const soldData = await searchSoldListings(barcode);
    const numSold = soldData.total || soldData.items.length;

    // 3. Calculate Sell-Through Rate
    const sellThroughRate = numActive > 0 ? ((numSold / numActive) * 100).toFixed(2) : 0;

    // 4. Recommended Price = Average Sold Price
    let recommendedPrice = null;
    if (soldData.items.length > 0) {
      const prices = soldData.items.map((item) => parseFloat(item.price)).filter((price) => !isNaN(price));

      if (prices.length > 0) {
        // Use average sold price
        recommendedPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
      }
    }

    return new Response(
      JSON.stringify({
        barcode,
        numActive,
        numSold,
        sellThroughRate,
        recommendedPrice,
        activeListings,
        soldListings: soldData.items,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error:", error); // <--- LOG THE ERROR
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
