import Link from "next/link";
import { ArrowLeft, ArrowRight, ReceiptText } from "lucide-react";
import { getTransactions } from "@/lib/queries";
import { formatCurrency, formatNumber, formatProbability } from "@/lib/format";
import { RiskBadge, FraudBadge } from "@/components/badge";
import { TransactionFilters } from "@/components/transaction-filters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

function hourLabel(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const risk = typeof sp.risk === "string" ? sp.risk : "all";
  const category = typeof sp.category === "string" ? sp.category : "all";
  const device = typeof sp.device === "string" ? sp.device : "all";
  const search = typeof sp.search === "string" ? sp.search : "";
  const page = Number.parseInt(
    typeof sp.page === "string" ? sp.page : "1",
    10,
  );

  const { rows, total } = await getTransactions({
    risk,
    category,
    device,
    search,
    page: Number.isFinite(page) ? page : 1,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const query = (p: number) => {
    const qs = new URLSearchParams();
    if (risk !== "all") qs.set("risk", risk);
    if (category !== "all") qs.set("category", category);
    if (device !== "all") qs.set("device", device);
    if (search) qs.set("search", search);
    qs.set("page", String(p));
    return `/transactions?${qs.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <ReceiptText className="h-5 w-5 text-indigo-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Transaction explorer
        </p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Every transaction, explained
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        {formatNumber(total)} scored transactions in the live network.
      </p>

      <div className="mt-6">
        <TransactionFilters />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.06] bg-ink-800/40">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5 font-medium">Transaction</th>
              <th className="px-5 py-3.5 font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Category</th>
              <th className="px-5 py-3.5 font-medium">Device</th>
              <th className="px-5 py-3.5 font-medium">Time</th>
              <th className="px-5 py-3.5 font-medium">Fraud score</th>
              <th className="px-5 py-3.5 font-medium">Risk</th>
              <th className="px-5 py-3.5 font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.02] last:border-0"
              >
                <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                  {r.transactionId}
                </td>
                <td className="px-5 py-3.5 font-semibold text-white">
                  {formatCurrency(r.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-md bg-white/[0.05] px-2 py-1 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-white/10">
                    {r.productCd}
                  </span>
                </td>
                <td className="px-5 py-3.5 capitalize text-slate-400">
                  {r.device}
                </td>
                <td className="px-5 py-3.5 text-slate-400">
                  {hourLabel(r.transactionHour)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(r.fraudProbability * 100)}%`,
                          background:
                            r.fraudProbability >= 0.75
                              ? "#f43f5e"
                              : r.fraudProbability >= 0.45
                                ? "#fb923c"
                                : r.fraudProbability >= 0.18
                                  ? "#f59e0b"
                                  : "#10b981",
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-slate-300">
                      {formatProbability(r.fraudProbability)}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <RiskBadge level={r.riskLevel} />
                </td>
                <td className="px-5 py-3.5">
                  <FraudBadge isFraud={r.isFraud} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages} · {formatNumber(total)} results
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={query(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "text-slate-300 hover:bg-white/[0.06]"
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Prev
          </Link>
          <Link
            href={query(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "text-slate-300 hover:bg-white/[0.06]"
            }`}
          >
            Next <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
