import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vertex/types", "@vertex/clients"]
};

export default nextConfig;
