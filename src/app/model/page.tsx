import { BrainCircuit, TreePine, DollarSign } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import {
  ModelCompareChart,
  RocCurveChart,
  PrCurveChart,
  CostCurveChart,
} from "@/components/charts/model";

export const dynamic = "force-dynamic";

const comparison = [
  { model: "Logistic Regression", prAuc: "0.1678", roc: "0.7576", f1: "0.116", recall: "0.746" },
  { model: "XGBoost (winner)", prAuc: "0.6412", roc: "0.9361", f1: "0.361", recall: "0.821", winner: true },
  { model: "LightGBM", prAuc: "0.6224", roc: "0.9301", f1: "0.338", recall: "0.820" },
  { model: "XGBoost + SMOTE", prAuc: "0.5294", roc: "0.8862", f1: "0.519", recall: "0.403" },
];

const shapFeatures = [
  { name: "log_amt", label: "Log transaction amount", value: 1.0 },
  { name: "C14", label: "Card transaction count (velocity)", value: 0.82 },
  { name: "C13", label: "Amount vs card mean ratio", value: 0.71 },
  { name: "card6_risk", label: "Card-type risk encoding", value: 0.58 },
  { name: "C1", label: "Product category encoding", value: 0.46 },
];

export default function ModelPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-indigo-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Model performance
        </p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        How the fraud model performs
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        XGBoost with <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs">scale_pos_weight</code>{" "}
        won against LightGBM, logistic regression, and SMOTE oversampling —
        evaluated on 590,540 real payment transactions.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="PR-AUC (primary)" value={0.6412} format="decimal" digits={4} icon="gauge" accent="indigo" hint="XGBoost, on fraud class" />
        <StatCard label="AUC-ROC" value={0.9361} format="decimal" digits={4} icon="activity" accent="cyan" hint="Excellent ranking power" />
        <StatCard label="Recall (fraud caught)" value={82.1} format="percent" digits={1} icon="compare" accent="emerald" hint="At optimized threshold" />
        <StatCard label="Optimal threshold" value={0.57} format="decimal" digits={2} icon="scale" accent="rose" hint="Minimizes total cost" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Model comparison"
          subtitle="PR-AUC is the primary metric given the 3.5% base rate"
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ModelCompareChart />
          </div>
        </ChartCard>

        <ChartCard
          title="ROC curves"
          subtitle="True positive rate vs false positive rate"
        >
          <div className="h-72">
            <RocCurveChart />
          </div>
        </ChartCard>

        <ChartCard
          title="Precision–recall curves"
          subtitle="Precision matters at a 3.5% fraud base rate"
        >
          <div className="h-72">
            <PrCurveChart />
          </div>
        </ChartCard>

        <ChartCard
          title="Cost vs decision threshold"
          subtitle="Optimum at 0.57 — balances $149 misses vs $10 false alarms"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <CostCurveChart />
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Comparison table */}
        <ChartCard title="Full comparison table" subtitle="Held-out test batch">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Model</th>
                  <th className="pb-3 pr-4 font-medium">PR-AUC</th>
                  <th className="pb-3 pr-4 font-medium">AUC-ROC</th>
                  <th className="pb-3 pr-4 font-medium">F1</th>
                  <th className="pb-3 font-medium">Recall</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((m) => (
                  <tr
                    key={m.model}
                    className={`border-b border-white/[0.04] last:border-0 ${
                      m.winner ? "bg-indigo-500/[0.06]" : ""
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {m.model}
                      {m.winner && (
                        <span className="ml-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-300">
                          Winner
                        </span>
                      )}
                    </td>
                    <td className={`py-3 pr-4 tabular-nums ${m.winner ? "font-semibold text-white" : "text-slate-300"}`}>{m.prAuc}</td>
                    <td className="py-3 pr-4 tabular-nums text-slate-300">{m.roc}</td>
                    <td className="py-3 pr-4 tabular-nums text-slate-300">{m.f1}</td>
                    <td className="py-3 tabular-nums text-slate-300">{m.recall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* SHAP features */}
        <ChartCard
          title="Top fraud predictors"
          subtitle="SHAP TreeExplainer global importance"
        >
          <div className="space-y-4">
            {shapFeatures.map((f) => (
              <div key={f.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-slate-300">{f.label}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {f.name}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${f.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="rounded-xl bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-slate-400 ring-1 ring-inset ring-white/10">
              Vesta&apos;s counting features (C-columns) proved more predictive
              than the 339 engineered V-columns for this model.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Cost matrix */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          { icon: DollarSign, label: "Missed fraud cost", value: "$149", desc: "Average direct loss per undetected fraud." },
          { icon: DollarSign, label: "False alarm cost", value: "$10", desc: "Investigation cost per wrongly flagged customer." },
          { icon: DollarSign, label: "Net value protected", value: "$402,511", desc: "Per test batch at the optimal threshold." },
        ].map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 ring-1 ring-inset ring-white/10">
              <c.icon className="h-5 w-5 text-emerald-300" />
            </span>
            <p className="mt-3 font-display text-2xl font-semibold text-white">{c.value}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">{c.label}</p>
            <p className="mt-1.5 text-xs text-slate-500">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-indigo-300" />
          <h2 className="font-display text-lg font-semibold text-white">
            Five fraud-prevention rules derived from SHAP
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { n: "01", t: "High-velocity card", d: "Flag cards with >50 transactions." },
            { n: "02", t: "Unusual spending", d: "Block amounts >5× a card's historical mean." },
            { n: "03", t: "High-risk email domain", d: "Extra verification for disposable domains." },
            { n: "04", t: "Early-morning alert", d: "Enhanced monitoring 5–9 AM (7 AM peak)." },
            { n: "05", t: "Category C review", d: "Manual review for C purchases over $200." },
          ].map((r) => (
            <div key={r.n} className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/10">
              <p className="font-display text-xs font-semibold tracking-widest text-indigo-300">
                RULE {r.n}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{r.t}</p>
              <p className="mt-1 text-xs text-slate-400">{r.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
