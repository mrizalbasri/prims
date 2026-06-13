import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Memaksa Next.js untuk tidak melakukan static generation
  // yang bisa memicu pemanggilan Prisma saat build time
  output: "standalone",
  experimental: {
    // Memberitahu Next.js bahwa Prisma adalah paket eksternal khusus Node.js
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
