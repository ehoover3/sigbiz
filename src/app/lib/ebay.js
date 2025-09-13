// src/lib/ebay.js

export const getEbayToken = async () => {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

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
    const errorText = await response.text();
    throw new Error(`Failed to get token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

export const searchEbayItems = async (token, query) => {
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  //   url.searchParams.append("q", query);
  //   url.searchParams.append("limit", "5");
  url.searchParams.append("gtin", query);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search failed: ${errorText}`);
  }

  return await response.json();
};
