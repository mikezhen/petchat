import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true, // Required for static export — no image optimisation server
  },
};

export default nextConfig;
