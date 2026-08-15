import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";
import { getDashboardStats, getFraudAlerts } from "@/lib/queries";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { RiskBadge } from "@/components/badge";
import {
  CategoryBar,
  DeviceDonut,
  HourArea,
  CardBar,
  AmountBars,
  RiskDonut,
} from "@/components/charts/dashboard";

export const dynamic = "force-dynamic";

const severityRank: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const alerts = await getFraudAlerts(8);

  const sortedAlerts = [...alerts].sort(
    (a, b) =>
      (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-indigo-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Fraud command center
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Risk intelligence, live
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Real-time view of the transaction network — segmented by category,
            device, hour, and card type.
          </p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110"
        >
          Scan new transaction
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI row */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Transactions analyzed"
          value={stats.totalTransactions}
          format="number"
          icon="activity"
          accent="indigo"
          hint="In the live scoring network"
        />
        <StatCard
          label="Network fraud rate"
          value={stats.fraudRate}
          format="percent"
          digits={2}
          icon="shield-alert"
          accent="rose"
          hint={`${formatNumber(stats.fraudCount)} flagged as fraud`}
        />
        <StatCard
          label="Fraud value blocked"
          value={stats.blockedFraudAmount}
          format="currency"
          icon="dollar"
          accent="emerald"
          hint="Captured above threshold"
        />
        <StatCard
          label="Fraud caught (recall)"
          value={stats.recall}
          format="percent"
          digits={1}
          icon="target"
          accent="cyan"
          hint={`${formatNumber(stats.falsePositiveCount)} false alarms`}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard
          title="Fraud rate by product category"
          subtitle="Category C is 3.3× the network average"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <CategoryBar data={stats.byCategory} />
          </div>
        </ChartCard>

        <ChartCard
          title="Fraud by device"
          subtitle="Mobile carries a higher risk premium"
        >
          <div className="h-72">
            <DeviceDonut data={stats.byDevice} />
          </div>
          <div className="mt-3 space-y-2">
            {stats.byDevice.map((d) => (
              <div key={d.device} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-400">{d.device}</span>
                <span className="font-semibold text-white">
                  {formatPercent(d.rate, 2)}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Fraud rate by hour of day"
          subtitle="Fraud peaks at 7 AM — the automated bot window"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <HourArea data={stats.byHour} />
          </div>
        </ChartCard>

        <ChartCard title="Risk distribution" subtitle="Scored risk levels">
          <div className="h-72">
            <RiskDonut data={stats.byRisk} />
          </div>
        </ChartCard>

        <ChartCard
          title="Fraud by card network"
          subtitle="Discover shows the highest fraud rate"
        >
          <div className="h-72">
            <CardBar data={stats.byCard} />
          </div>
        </ChartCard>

        <ChartCard
          title="Transaction amount distribution"
          subtitle="Fraud concentrates in the higher bands"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <AmountBars data={stats.amountBuckets} />
          </div>
        </ChartCard>
      </div>

      {/* Alerts feed */}
      <div className="mt-6 glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              Live fraud alerts
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Highest-severity detections from the scoring engine
            </p>
          </div>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            View all transactions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4 font-medium">Transaction</th>
                <th className="pb-3 pr-4 font-medium">Alert</th>
                <th className="pb-3 pr-4 font-medium">Rule</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {sortedAlerts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">
                    {a.transactionId}
                  </td>
                  <td className="py-3 pr-4 text-slate-200">{a.title}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{a.rule}</td>
                  <td className="py-3 pr-4 font-semibold text-white">
                    {formatCurrency(Number(a.amount))}
                  </td>
                  <td className="py-3">
                    <RiskBadge level={a.severity} />
                  </td>
                </tr>
              ))}
              {sortedAlerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No alerts yet — run a live scan to generate detections.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
