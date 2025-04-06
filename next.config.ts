import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // We'll handle ESLint separately
  },
};

export default nextConfig;
