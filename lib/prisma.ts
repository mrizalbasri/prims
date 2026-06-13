// Trik eval('require') untuk memaksa Next.js Turbopack memuat versi Node.js asli
const { PrismaClient } = eval('require("@prisma/client")');

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
