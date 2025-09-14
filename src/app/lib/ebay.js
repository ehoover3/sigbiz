// src/lib/ebay.js

export const getEbayOAuthToken = async () => {
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

export const searchEbayItemActiveListings = async (token, barcode, conditionFilter = "") => {
  const limit = 100; // max allowed by eBay
  let offset = 0;
  let allItems = [];

  // ---------- STEP 1: GTIN search ----------
  const gtinUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  gtinUrl.searchParams.append("gtin", barcode);
  gtinUrl.searchParams.append("limit", "5"); // just need a few for keywords

  const gtinRes = await fetch(gtinUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
    cache: "no-store",
  });

  if (!gtinRes.ok) throw new Error(`GTIN search failed: ${gtinRes.statusText}`);
  const gtinData = await gtinRes.json();
  const gtinItems = gtinData.itemSummaries || [];

  if (gtinItems.length === 0) return { itemSummaries: [] };

  // ---------- STEP 2: Extract keywords ----------
  // Take the title of the first GTIN item and remove special chars
  const seedTitle = gtinItems[0].title.replace(/[^a-zA-Z0-9 ]/g, "");
  const keywords = seedTitle.split(" ").slice(0, 8).join(" "); // take first 8 words for query

  // ---------- STEP 3: Keyword search with pagination ----------
  let hasMore = true;

  while (hasMore) {
    const keywordUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    keywordUrl.searchParams.append("q", keywords);
    keywordUrl.searchParams.append("limit", limit.toString());
    keywordUrl.searchParams.append("offset", offset.toString());
    if (conditionFilter) keywordUrl.searchParams.append("filter", conditionFilter);

    const res = await fetch(keywordUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Keyword search failed: ${res.statusText}`);

    const data = await res.json();
    const items = data.itemSummaries || [];
    allItems.push(...items);

    // Stop pagination if fewer than limit returned or reached total
    if (items.length < limit || allItems.length >= data.total) hasMore = false;
    else offset += limit;
  }

  return { itemSummaries: allItems };
};
