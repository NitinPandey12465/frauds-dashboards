import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedIfEmpty } from "@/lib/seed-data";

// Self-provisioning bootstrap. On Vercel (and any fresh hosted Postgres) there
// is no migration step, so the first request lazily creates the enums, tables
// and indexes, then seeds the dataset if the table is empty. Every statement is
// idempotent, so this is safe to run on every cold start.
const DDL: string[] = [
  // Enum types
  `DO $$ BEGIN CREATE TYPE product_cd AS ENUM ('W','H','C','S','R'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE device_type AS ENUM ('mobile','desktop'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE card_type AS ENUM ('visa','mastercard','discover','amex'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  // Tables
  `CREATE TABLE IF NOT EXISTS transactions (
    id serial PRIMARY KEY,
    transaction_id text NOT NULL UNIQUE,
    amount numeric(12,2) NOT NULL,
    product_cd product_cd NOT NULL,
    device_type device_type NOT NULL,
    card_type card_type NOT NULL,
    email_domain text NOT NULL,
    email_domain_risk numeric(6,4) NOT NULL,
    transaction_hour integer NOT NULL,
    addr_match boolean NOT NULL,
    card_txn_count integer NOT NULL,
    amt_to_card_mean_ratio numeric(10,4) NOT NULL,
    is_fraud boolean NOT NULL DEFAULT false,
    fraud_probability numeric(6,4) NOT NULL,
    risk_level risk_level NOT NULL DEFAULT 'low',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS fraud_alerts (
    id serial PRIMARY KEY,
    transaction_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    rule text NOT NULL,
    severity risk_level NOT NULL DEFAULT 'high',
    amount numeric(12,2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_transactions_is_fraud ON transactions (is_fraud)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_product_cd ON transactions (product_cd)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_hour ON transactions (transaction_hour)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_risk ON transactions (risk_level)`,
  `CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON fraud_alerts (severity)`,
];

let readyPromise: Promise<void> | null = null;

export function ensureDatabaseReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      for (const statement of DDL) {
        await db.execute(sql.raw(statement));
      }
      await seedIfEmpty();
    })().catch((err) => {
      // Allow a retry on the next request if provisioning failed mid-flight.
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}
