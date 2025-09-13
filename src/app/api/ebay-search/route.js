// src/app/api/ebay-search/route.js
import { getEbayToken, searchActiveListings } from "../../lib/ebay";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) return new Response(JSON.stringify({ error: "Barcode is required" }), { status: 400 });

    const token = await getEbayToken();
    const activeData = await searchActiveListings(token, barcode);

    // Return active listings only
    return new Response(JSON.stringify({ activeListings: activeData.itemSummaries || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("eBay API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
