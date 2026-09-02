import type { NextConfig } from "next";
import { getDeploymentConfig } from "@/lib/deployment-config";

const deployment = getDeploymentConfig(process.env.GITHUB_ACTIONS === "true");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: deployment.output,
  images: { unoptimized: true },
  basePath: deployment.basePath,
  env: { NEXT_PUBLIC_BASE_PATH: deployment.basePath },
};

export default nextConfig;
