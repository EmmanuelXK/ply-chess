import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lichess-org/chessground"],
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    const isolated = [
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
    ];
    return [
      {
        source: "/:path*",
        headers: isolated,
      },
      {
        source: "/engines/:path*",
        headers: [
          ...isolated,
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/engines/lc0/weights_9155.txt.gz",
        headers: [
          ...isolated,
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
