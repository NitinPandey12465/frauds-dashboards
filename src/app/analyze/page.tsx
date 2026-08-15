"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  Sparkles,
  Wallet,
  Package,
  Smartphone,
  CreditCard,
  AtSign,
  Clock,
  MapPin,
  Gauge,
  Zap,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import type { RiskLevel } from "@/lib/scoring";
import { FraudGauge, ContributionBars } from "@/components/score-display";
import { formatCurrency } from "@/lib/format";

type ProductCd = "W" | "H" | "C" | "S" | "R";

interface ScoreResponse {
  transactionId: string;
  probability: number;
  riskLevel: RiskLevel;
  contributions: { key: string; label: string; value: number; detail: string }[];
  triggeredRules: { id: number; title: string; detail: string }[];
  recommendation: string;
}

interface FormState {
  amount: number;
  productCd: ProductCd;
  device: "mobile" | "desktop";
  cardType: "visa" | "mastercard" | "discover" | "amex";
  emailDomain: string;
  hour: number;
  addrMatch: boolean;
  cardTxnCount: number;
  amtToCardMeanRatio: number;
}

const defaults: FormState = {
  amount: 248,
  productCd: "W",
  device: "desktop",
  cardType: "visa",
  emailDomain: "gmail.com",
  hour: 14,
  addrMatch: true,
  cardTxnCount: 4,
  amtToCardMeanRatio: 1.2,
};

const presets: { name: string; icon: typeof Wallet; state: FormState }[] = [
  {
    name: "Legit purchase",
    icon: CheckCircle2,
    state: {
      amount: 84.5,
      productCd: "W",
      device: "desktop",
      cardType: "visa",
      emailDomain: "gmail.com",
      hour: 14,
      addrMatch: true,
      cardTxnCount: 3,
      amtToCardMeanRatio: 0.8,
    },
  },
  {
    name: "Card testing",
    icon: Zap,
    state: {
      amount: 0.29,
      productCd: "C",
      device: "mobile",
      cardType: "discover",
      emailDomain: "mailinator.com",
      hour: 7,
      addrMatch: false,
      cardTxnCount: 64,
      amtToCardMeanRatio: 7.2,
    },
  },
  {
    name: "Account takeover",
    icon: AlertTriangle,
    state: {
      amount: 1249,
      productCd: "C",
      device: "mobile",
      cardType: "visa",
      emailDomain: "protonmail.com",
      hour: 6,
      addrMatch: false,
      cardTxnCount: 45,
      amtToCardMeanRatio: 5.5,
    },
  },
];

const inputBase =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20";

function hourLabel(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition",
            value === o.value
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow"
              : "text-slate-400 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AnalyzePage() {
  const [form, setForm] = useState<FormState>(defaults);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function runScan(state: FormState = form) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Scoring failed");
      }
      const data: ScoreResponse = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scoring failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(state: FormState) {
    setForm(state);
    runScan(state);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-indigo-400" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Live transaction scanner
          </p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Score any transaction in real time
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter payment details and Sentinel will return a fraud probability,
          the exact factors driving it, and the recommended action.
        </p>
      </div>

      {/* Presets */}
      <div className="mt-6 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => applyPreset(p.state)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <p.icon className="h-3.5 w-3.5 text-indigo-300" />
            {p.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="glass rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <Wallet className="h-4 w-4 text-indigo-300" /> Transaction details
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" /> Amount
                </span>
                <span className="font-semibold text-white">
                  {formatCurrency(form.amount)}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={2500}
                step={5}
                value={form.amount}
                onChange={(e) => set("amount", Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Package className="h-3.5 w-3.5" /> Product category
                </label>
                <select
                  value={form.productCd}
                  onChange={(e) => set("productCd", e.target.value as ProductCd)}
                  className={inputBase}
                >
                  <option value="W">W — General retail</option>
                  <option value="H">H — Home goods</option>
                  <option value="C">C — Digital & gift cards</option>
                  <option value="S">S — Software & services</option>
                  <option value="R">R — Travel & rewards</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <CreditCard className="h-3.5 w-3.5" /> Card network
                </label>
                <select
                  value={form.cardType}
                  onChange={(e) =>
                    set("cardType", e.target.value as FormState["cardType"])
                  }
                  className={inputBase}
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="discover">Discover</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <AtSign className="h-3.5 w-3.5" /> Email domain
              </label>
              <input
                type="text"
                value={form.emailDomain}
                onChange={(e) => set("emailDomain", e.target.value)}
                className={inputBase}
                placeholder="gmail.com"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Time of day
                </span>
                <span className="font-semibold text-white">
                  {form.hour}:00 · {hourLabel(form.hour)}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={23}
                value={form.hour}
                onChange={(e) => set("hour", Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Smartphone className="h-3.5 w-3.5" /> Device
                </label>
                <Segmented
                  options={[
                    { value: "mobile", label: "Mobile" },
                    { value: "desktop", label: "Desktop" },
                  ]}
                  value={form.device}
                  onChange={(v) => set("device", v)}
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> Address match
                </label>
                <Segmented
                  options={[
                    { value: "match", label: "Match" },
                    { value: "mismatch", label: "Mismatch" },
                  ]}
                  value={form.addrMatch ? "match" : "mismatch"}
                  onChange={(v) => set("addrMatch", v === "match")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" /> Card velocity
                  </span>
                  <span className="font-semibold text-white">
                    {form.cardTxnCount} txns
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={form.cardTxnCount}
                  onChange={(e) => set("cardTxnCount", Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Spend ratio
                  </span>
                  <span className="font-semibold text-white">
                    {form.amtToCardMeanRatio.toFixed(1)}×
                  </span>
                </label>
                <input
                  type="range"
                  min={0.2}
                  max={10}
                  step={0.1}
                  value={form.amtToCardMeanRatio}
                  onChange={(e) =>
                    set("amtToCardMeanRatio", Number(e.target.value))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => runScan()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scoring…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run fraud analysis
                </>
              )}
            </button>

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-inset ring-rose-400/30">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="glass rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-indigo-300" /> Verdict
          </h2>

          <AnimatePresence mode="wait">
            {!result && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-[420px] flex-col items-center justify-center text-center"
              >
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10">
                  <ScanLine className="h-7 w-7 text-slate-500" />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Run a scan to see the fraud probability,
                  <br /> driving factors, and recommended action.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={result?.transactionId ?? "loading"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {loading && !result && (
                  <div className="flex h-[420px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                  </div>
                )}

                {result && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">{result.transactionId}</span>
                      <span className="capitalize">{form.device} · {hourLabel(form.hour)}</span>
                    </div>

                    <div className="mt-1">
                      <FraudGauge
                        probability={result.probability}
                        riskLevel={result.riskLevel}
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-white/[0.04] px-4 py-3 ring-1 ring-inset ring-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Recommended action
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        {result.recommendation}
                      </p>
                    </div>

                    {result.triggeredRules.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Triggered rules
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.triggeredRules.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-inset ring-amber-400/30"
                              title={r.detail}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {r.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Why this score? (feature contributions)
                      </p>
                      <ContributionBars contributions={result.contributions} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
