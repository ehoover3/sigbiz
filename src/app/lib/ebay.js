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
export const searchActiveListings = async (token, barcode) => {
  const allItems = [];
  const limit = 50; // max per request
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.append("gtin", barcode);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Active search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.itemSummaries || [];
    allItems.push(...items);

    // If less than limit returned, no more pages
    if (items.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  // If too few results, fallback to keyword search
  if (allItems.length < 10) {
    const keywordUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    keywordUrl.searchParams.append("q", barcode);
    keywordUrl.searchParams.append("limit", limit);

    const keywordResponse = await fetch(keywordUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!keywordResponse.ok) {
      throw new Error(`Keyword search failed: ${keywordResponse.statusText}`);
    }

    const keywordData = await keywordResponse.json();
    allItems.push(...(keywordData.itemSummaries || []));
  }

  return { itemSummaries: allItems };
};
