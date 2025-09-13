// src/lib/ebay.js

// ------------------------
// 1. Fetch OAuth Token
// ------------------------
export const getEbayToken = async () => {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing eBay API credentials in environment variables.");
  }

  const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${base64Credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
};

// ------------------------
// 2. Active Listings Search
// ------------------------
export const searchActiveListings = async (token, barcode, conditionFilter = "") => {
  const allItems = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.append("gtin", barcode);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());
    if (conditionFilter) url.searchParams.append("filter", conditionFilter);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Active search failed: ${res.statusText}`);

    const data = await res.json();
    const items = data.itemSummaries || [];
    allItems.push(...items);

    if (items.length < limit) hasMore = false;
    else offset += limit;
  }

  return { itemSummaries: allItems };
};
