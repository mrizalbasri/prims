import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize PrismaClient");
  }

  const adapter = new PrismaPg(
    new Pool({
      connectionString: databaseUrl,
      max: 10,
    }),
  );

  const logOptions = process.env.NODE_ENV === "production"
    ? ["warn", "error"] as const
    : ["query", "info", "warn", "error"] as const;

  return new PrismaClient({
    adapter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: logOptions as any,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
