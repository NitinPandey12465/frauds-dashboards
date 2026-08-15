import { db } from "@/db";
import { transactions, fraudAlerts } from "@/db/schema";
import { ensureDatabaseReady } from "@/db/init";
import { sql, asc, desc, eq, and, ilike, inArray } from "drizzle-orm";

export interface CategoryStat {
  productCd: string;
  count: number;
  fraud: number;
  rate: number;
}

export interface HourStat {
  hour: number;
  count: number;
  fraud: number;
  rate: number;
}

export interface CardStat {
  cardType: string;
  count: number;
  fraud: number;
  rate: number;
}

export interface DashboardStats {
  totalTransactions: number;
  fraudCount: number;
  fraudRate: number;
  fraudAmount: number;
  blockedFraudAmount: number;
  recall: number;
  falsePositiveCount: number;
  byCategory: CategoryStat[];
  byDevice: { device: string; count: number; fraud: number; rate: number }[];
  byHour: HourStat[];
  byCard: CardStat[];
  byRisk: { riskLevel: string; count: number }[];
  amountBuckets: { label: string; count: number; fraud: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureDatabaseReady();
  const [summary] = await db
    .select({
      total: sql<number>`count(*)::int`,
      fraud: sql<number>`sum(case when is_fraud then 1 else 0 end)::int`,
      fraudAmount: sql<number>`coalesce(sum(case when is_fraud then amount else 0 end), 0)::float`,
      blocked: sql<number>`coalesce(sum(case when is_fraud and fraud_probability >= 0.18 then amount else 0 end), 0)::float`,
      caught: sql<number>`coalesce(sum(case when is_fraud and fraud_probability >= 0.18 then 1 else 0 end), 0)::int`,
      falsePos: sql<number>`sum(case when not is_fraud and fraud_probability >= 0.18 then 1 else 0 end)::int`,
    })
    .from(transactions);

  const [byCategory, byDevice, byHour, byCard, byRisk, amountBuckets] =
    await Promise.all([
      db
        .select({
          productCd: transactions.productCd,
          count: sql<number>`count(*)::int`,
          fraud: sql<number>`sum(case when is_fraud then 1 else 0 end)::int`,
        })
        .from(transactions)
        .groupBy(transactions.productCd)
        .orderBy(desc(sql`sum(case when is_fraud then 1 else 0 end)::int`)),
      db
        .select({
          device: transactions.device,
          count: sql<number>`count(*)::int`,
          fraud: sql<number>`sum(case when is_fraud then 1 else 0 end)::int`,
        })
        .from(transactions)
        .groupBy(transactions.device),
      db
        .select({
          hour: transactions.transactionHour,
          count: sql<number>`count(*)::int`,
          fraud: sql<number>`sum(case when is_fraud then 1 else 0 end)::int`,
        })
        .from(transactions)
        .groupBy(transactions.transactionHour)
        .orderBy(asc(transactions.transactionHour)),
      db
        .select({
          cardType: transactions.cardType,
          count: sql<number>`count(*)::int`,
          fraud: sql<number>`sum(case when is_fraud then 1 else 0 end)::int`,
        })
        .from(transactions)
        .groupBy(transactions.cardType)
        .orderBy(desc(sql`sum(case when is_fraud then 1 else 0 end)::int`)),
      db
        .select({
          riskLevel: transactions.riskLevel,
          count: sql<number>`count(*)::int`,
        })
        .from(transactions)
        .groupBy(transactions.riskLevel),
      db
        .select({
          bucket: sql<string>`(
            case
              when amount < 50 then '$0–50'
              when amount < 150 then '$50–150'
              when amount < 500 then '$150–500'
              when amount < 1500 then '$500–1.5K'
              else '$1.5K+'
            end
          )`,
          count: sql<number>`count(*)::int`,
          fraud: sql<number>`sum(case when is_fraud then 1 else 0 end)::int`,
        })
        .from(transactions)
        .groupBy(sql`1`),
    ]);

  const total = summary?.total ?? 0;
  const fraudCount = summary?.fraud ?? 0;
  const fraudRate = total > 0 ? (fraudCount / total) * 100 : 0;
  const recall =
    fraudCount > 0 ? ((summary?.caught ?? 0) / fraudCount) * 100 : 0;

  const amountOrder = ["$0–50", "$50–150", "$150–500", "$500–1.5K", "$1.5K+"];

  return {
    totalTransactions: total,
    fraudCount,
    fraudRate,
    fraudAmount: summary?.fraudAmount ?? 0,
    blockedFraudAmount: summary?.blocked ?? 0,
    recall,
    falsePositiveCount: summary?.falsePos ?? 0,
    byCategory: byCategory.map((r) => ({
      productCd: r.productCd,
      count: r.count,
      fraud: r.fraud,
      rate: r.count > 0 ? (r.fraud / r.count) * 100 : 0,
    })),
    byDevice: byDevice.map((r) => ({
      device: r.device,
      count: r.count,
      fraud: r.fraud,
      rate: r.count > 0 ? (r.fraud / r.count) * 100 : 0,
    })),
    byHour: Array.from({ length: 24 }, (_, h) => {
      const found = byHour.find((r) => r.hour === h);
      return found
        ? {
            hour: h,
            count: found.count,
            fraud: found.fraud,
            rate: found.count > 0 ? (found.fraud / found.count) * 100 : 0,
          }
        : { hour: h, count: 0, fraud: 0, rate: 0 };
    }),
    byCard: byCard.map((r) => ({
      cardType: r.cardType,
      count: r.count,
      fraud: r.fraud,
      rate: r.count > 0 ? (r.fraud / r.count) * 100 : 0,
    })),
    byRisk: byRisk.map((r) => ({ riskLevel: r.riskLevel, count: r.count })),
    amountBuckets: amountBuckets
      .map((r) => ({ label: r.bucket, count: r.count, fraud: r.fraud }))
      .sort(
        (a, b) => amountOrder.indexOf(a.label) - amountOrder.indexOf(b.label),
      ),
  };
}

export interface TransactionFilters {
  risk?: string;
  category?: string;
  device?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TransactionRow {
  id: number;
  transactionId: string;
  amount: number;
  productCd: string;
  device: string;
  cardType: string;
  emailDomain: string;
  transactionHour: number;
  isFraud: boolean;
  fraudProbability: number;
  riskLevel: string;
  createdAt: Date;
}

export async function getTransactions(
  filters: TransactionFilters,
): Promise<{ rows: TransactionRow[]; total: number }> {
  await ensureDatabaseReady();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 12));

  const conditions = [];
  if (filters.risk && filters.risk !== "all")
    conditions.push(eq(transactions.riskLevel, filters.risk as never));
  if (filters.category && filters.category !== "all")
    conditions.push(eq(transactions.productCd, filters.category as never));
  if (filters.device && filters.device !== "all")
    conditions.push(eq(transactions.device, filters.device as never));
  if (filters.search)
    conditions.push(ilike(transactions.transactionId, `%${filters.search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(where),
  ]);

  return {
    rows: rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      fraudProbability: Number(r.fraudProbability),
      createdAt: r.createdAt as Date,
    })),
    total: countRows[0]?.count ?? 0,
  };
}

export async function getFraudAlerts(limit = 8) {
  await ensureDatabaseReady();
  return db
    .select()
    .from(fraudAlerts)
    .orderBy(desc(fraudAlerts.createdAt))
    .limit(limit);
}
