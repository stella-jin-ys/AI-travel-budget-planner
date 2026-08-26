import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "export",
  images: { unoptimized: true },
  basePath: process.env.GITHUB_ACTIONS ? "/AI-travel-budget-planner" : "",
};

export default nextConfig;
