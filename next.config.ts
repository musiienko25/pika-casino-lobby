import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'casino.api.pikakasino.com',
      },
      {
        protocol: 'https',
        hostname: '**.pikakasino.com',
      },
    ],
  },
  // Performance optimizations
  compress: true,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Set Turbopack root directory to silence warning about multiple lockfiles
  turbopack: {
    root: process.cwd(),
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Note: swcMinify is enabled by default in Next.js 13+
};

export default nextConfig;
