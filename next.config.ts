import type { NextConfig } from "next";

console.log("EBAY_CLIENT_ID at build time:", process.env.EBAY_CLIENT_ID);
console.log("EBAY_CLIENT_SECRET at build time:", process.env.EBAY_CLIENT_SECRET);
console.log("EBAY_DEV_ID at build time:", process.env.EBAY_DEV_ID);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
