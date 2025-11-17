import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**", // Giữ để allow nếu cần
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*", // Match /uploads/categories/..., /uploads/products/...
        destination: "http://localhost:5000/uploads/:path*", // Proxy đến BE
      },
    ];
  },
};

export default nextConfig;
