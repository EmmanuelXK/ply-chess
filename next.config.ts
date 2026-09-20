import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lichess-org/chessground"],
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/engines/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
