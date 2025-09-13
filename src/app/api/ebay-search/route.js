// src/app/api/ebay-search/route.js
import { getEbayToken, searchEbayItems } from "../../lib/ebay.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "iPhone";

  try {
    const token = await getEbayToken();
    const results = await searchEbayItems(token, query);
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
