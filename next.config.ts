import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "swr$": path.resolve(process.cwd(), "node_modules/swr/dist/index/index.mjs"),
    };
    return config;
  },
};

export default nextConfig;
