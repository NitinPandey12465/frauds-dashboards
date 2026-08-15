"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Filter, X } from "lucide-react";

const selectBase =
  "rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/60";

export function TransactionFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const risk = params.get("risk") ?? "all";
  const category = params.get("category") ?? "all";
  const device = params.get("device") ?? "all";
  const search = params.get("search") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    if (key !== "search") next.delete("page");
    startTransition(() => router.push(`/transactions?${next.toString()}`));
  }

  const hasFilters = risk !== "all" || category !== "all" || device !== "all" || search;

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Filter className="h-4 w-4" /> Filters
      </div>

      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search transaction ID…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-400/60"
        />
      </div>

      <select
        value={risk}
        onChange={(e) => update("risk", e.target.value)}
        className={selectBase}
      >
        <option value="all">All risk levels</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <select
        value={category}
        onChange={(e) => update("category", e.target.value)}
        className={selectBase}
      >
        <option value="all">All categories</option>
        <option value="W">Category W</option>
        <option value="H">Category H</option>
        <option value="C">Category C</option>
        <option value="S">Category S</option>
        <option value="R">Category R</option>
      </select>

      <select
        value={device}
        onChange={(e) => update("device", e.target.value)}
        className={selectBase}
      >
        <option value="all">All devices</option>
        <option value="mobile">Mobile</option>
        <option value="desktop">Desktop</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push("/transactions")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-400 transition hover:text-white"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}

      {pending && (
        <span className="text-xs text-indigo-300">Updating…</span>
      )}
    </div>
  );
}
