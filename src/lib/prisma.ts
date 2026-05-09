import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/** pg.Pool no entiende los parámetros prisma-only; hay que quitarlos */
function cleanConnectionString(url: string) {
  const [base, query] = url.split("?");
  if (!query) return url;
  const params = query
    .split("&")
    .filter((p) => !p.startsWith("pgbouncer=") && !p.startsWith("connection_limit="));
  return params.length > 0 ? `${base}?${params.join("&")}` : base;
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: cleanConnectionString(process.env.DATABASE_URL!),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
    max: 1,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
