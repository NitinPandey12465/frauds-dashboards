import { db } from "@/db";
import { transactions, fraudAlerts } from "@/db/schema";
import { sql } from "drizzle-orm";
import {
  scoreTransaction,
  type CardType,
  type DeviceType,
  type ProductCd,
} from "./scoring";

// Deterministic PRNG so the seed is reproducible across runs.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const PRODUCTS: ProductCd[] = ["W", "H", "C", "S", "R"];
const PRODUCT_WEIGHTS = [35, 20, 12, 20, 13];

const DEVICES: DeviceType[] = ["mobile", "desktop"];
const DEVICE_WEIGHTS = [45, 55];

const CARDS: CardType[] = ["visa", "mastercard", "discover", "amex"];
const CARD_WEIGHTS = [50, 28, 8, 14];

const DOMAINS: { domain: string; w: number }[] = [
  { domain: "gmail.com", w: 38 },
  { domain: "yahoo.com", w: 18 },
  { domain: "outlook.com", w: 12 },
  { domain: "hotmail.com", w: 7 },
  { domain: "icloud.com", w: 8 },
  { domain: "aol.com", w: 5 },
  { domain: "protonmail.com", w: 4 },
  { domain: "mail.ru", w: 3 },
  { domain: "mailinator.com", w: 2 },
  { domain: "tempmail.com", w: 1.5 },
  { domain: "guerrillamail.com", w: 1 },
  { domain: "yopmail.com", w: 0.5 },
];

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwawaymail.com",
  "dispostable.com",
  "fakemail.com",
  "getnada.com",
  "trashmail.com",
]);

const HIGH_RISK_DOMAINS = new Set([
  "protonmail.com",
  "tutanota.com",
  "cock.li",
  "mail.ru",
]);

function emailDomainRiskNum(domain: string): number {
  if (DISPOSABLE_DOMAINS.has(domain)) return 0.92;
  if (HIGH_RISK_DOMAINS.has(domain)) return 0.48;
  return 0.06;
}

function hourSample(rng: () => number): number {
  // Morning spike around 7AM (bot window) + evening commerce peak.
  const buckets = [
    7, 7, 6, 8, 5, 9, 12, 13, 14, 18, 19, 20, 21, 22, 10, 11, 15, 16, 17, 23,
    0, 1, 2, 3, 4,
  ];
  const weights = [
    14, 11, 7, 7, 5, 4, 5, 4, 5, 7, 8, 6, 5, 3, 3, 3, 3, 3, 2, 2, 1, 0.7, 0.5,
    0.4, 0.4,
  ];
  const h = pick(rng, buckets, weights);
  return h + Math.round((rng() - 0.5) * 2);
}

function amountSample(rng: () => number): number {
  // Log-normal-ish amount with a heavy tail, matching the $0.29 .. $5,191 range.
  const u = Math.log(1 + rng() * 900) * (rng() < 0.7 ? 0.7 : 1.8);
  const amt = Math.max(0.29, Math.min(5200, u + rng() * 120));
  return Math.round(amt * 100) / 100;
}

interface GeneratedSeed {
  rows: (typeof transactions.$inferInsert)[];
  alerts: (typeof fraudAlerts.$inferInsert)[];
}

// Builds the synthetic dataset in-memory (no DB access) so it can be reused by
// both the local dev seed script and the production auto-init.
export function generateSeedData(): GeneratedSeed {
  const rng = mulberry32(20260214);
  const N = 2200;

  const rows: (typeof transactions.$inferInsert)[] = [];
  const alerts: (typeof fraudAlerts.$inferInsert)[] = [];
  const fraudCandidates: {
    transactionId: string;
    amount: number;
    probability: number;
    rules: { id: number; title: string; detail: string }[];
    createdAt: Date;
  }[] = [];

  let txnIdCounter = 482_910_000;

  const categoryRates: Record<ProductCd, number> = {
    W: 0.0203,
    H: 0.0476,
    C: 0.1169,
    S: 0.059,
    R: 0.0378,
  };

  const fraudDomains = [
    "mailinator.com",
    "tempmail.com",
    "guerrillamail.com",
    "yopmail.com",
    "10minutemail.com",
    "protonmail.com",
    "mail.ru",
  ];

  for (let i = 0; i < N; i++) {
    const productCd = pick(rng, PRODUCTS, PRODUCT_WEIGHTS);
    let device = pick(rng, DEVICES, DEVICE_WEIGHTS);
    let cardType = pick(rng, CARDS, CARD_WEIGHTS);
    let email = pick(rng, DOMAINS, DOMAINS.map((d) => d.w));
    let hour = hourSample(rng);
    let addrMatch = rng() > 0.06;
    let amount = amountSample(rng);
    let cardTxnCount = Math.floor(rng() * 28);
    let amtToCardMeanRatio = 0.4 + rng() * 1.8;

    // Decide the label first, then inject the causal fraud signals — so
    // fraudulent transactions genuinely score high and legit ones score low.
    const isFraud = rng() < categoryRates[productCd];

    if (isFraud) {
      if (rng() < 0.75)
        email = { domain: fraudDomains[Math.floor(rng() * fraudDomains.length)], w: 1 };
      if (rng() < 0.6) device = "mobile";
      if (rng() < 0.7) hour = 5 + Math.floor(rng() * 5); // 5–9 AM bot window
      if (rng() < 0.6) addrMatch = false;
      if (rng() < 0.85) cardTxnCount = 30 + Math.floor(rng() * 60);
      if (rng() < 0.8) amtToCardMeanRatio = 3 + rng() * 7;
      if (rng() < 0.5) amount = 200 + rng() * 2300;
      if (rng() < 0.22) cardType = "discover";
    } else {
      // A few legit-but-suspicious cases produce realistic false positives.
      if (rng() < 0.02) cardTxnCount = 30 + Math.floor(rng() * 30);
      if (rng() < 0.015) addrMatch = false;
      if (rng() < 0.02) email = { domain: "protonmail.com", w: 1 };
    }

    const result = scoreTransaction({
      amount,
      productCd,
      device,
      cardType,
      emailDomain: email.domain,
      hour,
      addrMatch,
      cardTxnCount,
      amtToCardMeanRatio,
    });

    const createdAt = new Date(
      Date.now() - Math.floor(rng() * 14 * 24 * 60 * 60 * 1000),
    );

    const transactionId = `TX-${(txnIdCounter++).toString(36).toUpperCase()}`;

    rows.push({
      transactionId,
      amount: amount.toFixed(2),
      productCd,
      device,
      cardType,
      emailDomain: email.domain,
      emailDomainRisk: String(Math.round(emailDomainRiskNum(email.domain) * 10000) / 10000),
      transactionHour: Math.max(0, Math.min(23, hour)),
      addrMatch,
      cardTxnCount,
      amtToCardMeanRatio: String(Math.round(amtToCardMeanRatio * 10000) / 10000),
      isFraud,
      fraudProbability: String(Math.round(result.probability * 10000) / 10000),
      riskLevel: result.riskLevel,
      createdAt,
    });

    if (isFraud) {
      fraudCandidates.push({
        transactionId,
        amount,
        probability: result.probability,
        rules: result.triggeredRules,
        createdAt,
      });
    }
  }

  // Build a rich alerts feed from the highest-probability fraud cases.
  fraudCandidates
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 14)
    .forEach((c) => {
      const top = c.rules[0] ?? {
        id: 0,
        title: "Composite risk alert",
        detail: "Multiple risk signals detected.",
      };
      const severity =
        c.probability >= 0.5 ? "critical" : c.probability >= 0.18 ? "high" : "medium";
      alerts.push({
        transactionId: c.transactionId,
        title: top.title,
        description: top.detail,
        rule: top.title,
        severity: severity as "low" | "medium" | "high" | "critical",
        amount: c.amount.toFixed(2),
        createdAt: new Date(c.createdAt.getTime() + 1000),
      });
    });

  return { rows, alerts };
}

// Inserts the dataset only when the table is empty. Used by the production
// auto-init so a freshly deployed Vercel app is immediately populated.
export async function seedIfEmpty(): Promise<boolean> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions);
  if (count > 0) return false;

  const { rows, alerts } = generateSeedData();
  await db.insert(transactions).values(rows);
  if (alerts.length > 0) await db.insert(fraudAlerts).values(alerts);
  return true;
}

// Full (re)seed used by the local dev script.
export async function runSeed(opts: { truncate?: boolean } = {}): Promise<number> {
  if (opts.truncate) {
    await db.execute(
      sql`TRUNCATE TABLE fraud_alerts, transactions RESTART IDENTITY CASCADE`,
    );
  }

  const { rows, alerts } = generateSeedData();
  await db.insert(transactions).values(rows);
  if (alerts.length > 0) await db.insert(fraudAlerts).values(alerts);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions);
  return count;
}
