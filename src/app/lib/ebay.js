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
  // First, try GTIN search
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.append("gtin", barcode);
  url.searchParams.append("limit", "50"); // max allowed

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

  // If GTIN search returns very few results, fallback to keyword search
  if ((data.itemSummaries || []).length < 10) {
    console.log("Fallback to keyword search for active listings...");

    const keywordUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    keywordUrl.searchParams.append("q", barcode);
    keywordUrl.searchParams.append("limit", "50");

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

    return await keywordResponse.json();
  }

  return data;
};

// ------------------------
// 3. Sold Listings Search (Finding API)
// ------------------------
export const searchSoldListings = async (barcode) => {
  const appId = process.env.EBAY_CLIENT_ID;

  if (!appId) {
    throw new Error("Missing eBay App ID in environment variables.");
  }

  const url = new URL("https://svcs.ebay.com/services/search/FindingService/v1");
  url.searchParams.append("OPERATION-NAME", "findCompletedItems");
  url.searchParams.append("SERVICE-VERSION", "1.0.0");
  url.searchParams.append("SECURITY-APPNAME", appId);
  url.searchParams.append("RESPONSE-DATA-FORMAT", "JSON");
  url.searchParams.append("REST-PAYLOAD", "");
  url.searchParams.append("keywords", barcode);

  // Only sold items
  url.searchParams.append("itemFilter.name", "SoldItemsOnly");
  url.searchParams.append("itemFilter.value", "true");

  // Request up to 100 results
  url.searchParams.append("paginationInput.entriesPerPage", "100");
  url.searchParams.append("paginationInput.pageNumber", "1");

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Sold search failed: ${response.statusText}`);
  }

  const data = await response.json();

  const searchResult = data.findCompletedItemsResponse?.[0]?.searchResult?.[0];
  const totalEntries = parseInt(searchResult?.["@count"] || "0", 10);
  const items = searchResult?.item || [];

  return {
    total: totalEntries,
    items: items.map((item) => ({
      title: item.title?.[0],
      price: item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__,
      currency: item.sellingStatus?.[0]?.currentPrice?.[0]?.["@currencyId"],
      soldDate: item.listingInfo?.[0]?.endTime?.[0],
      url: item.viewItemURL?.[0],
    })),
  };
};
