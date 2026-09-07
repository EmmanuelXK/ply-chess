import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lichess-org/chessground"],
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
