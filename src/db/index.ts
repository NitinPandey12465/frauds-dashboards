import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Set it in .env (local) or in your Vercel project settings.",
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __fraudShieldPgPool?: Pool;
};

// Serverless-friendly pool: capped connections, sensible timeouts, and SSL
// auto-enabled for hosted providers (Neon / Supabase / Vercel Postgres) whose
// connection strings include ?sslmode=require.
export const pool =
  globalForDb.__fraudShieldPgPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    ssl:
      databaseUrl.includes("sslmode=require") ||
      databaseUrl.includes("sslmode=no-verify") ||
      databaseUrl.includes("sslmode=verify-full") ||
      databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__fraudShieldPgPool = pool;
}

export const db = drizzle(pool);
