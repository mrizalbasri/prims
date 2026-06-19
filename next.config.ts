import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
  typescript: {
    // Prevent TypeScript compilation OOM on resource-constrained environments
    ignoreBuildErrors: true,
  },
  experimental: {
    // Limit workers to 1 to prevent OOM errors on page collection phase
    cpus: 1,
  },
};


export default nextConfig;
