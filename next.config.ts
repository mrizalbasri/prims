import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
