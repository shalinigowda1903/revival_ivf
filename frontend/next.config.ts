import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "192.168.1.7",
    "192.168.1.*",
    "192.168.*",
    "10.*",
    "192.168.1.13",
    "192.168.1.14",
    "10.38.58.53",
    "10.38.58.167",
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8001/:path*",
      },
    ];
  },
};

export default nextConfig;
