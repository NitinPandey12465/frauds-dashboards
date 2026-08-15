"use client";

import { motion } from "framer-motion";
import type { FeatureContribution, RiskLevel } from "@/lib/scoring";
import clsx from "clsx";

const riskColor: Record<RiskLevel, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#fb923c",
  critical: "#f43f5e",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  critical: "Critical risk",
};

export function FraudGauge({
  probability,
  riskLevel,
}: {
  probability: number;
  riskLevel: RiskLevel;
}) {
  const p = Math.min(1, Math.max(0, probability));
  const arcLen = Math.PI * 90;
  const rotation = (p - 0.5) * 180;

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox="0 0 200 128" className="w-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>

        {/* tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const a = Math.PI * (1 - i / 10);
          const x1 = 100 + 76 * Math.cos(a);
          const y1 = 110 - 76 * Math.sin(a);
          const x2 = 100 + 82 * Math.cos(a);
          const y2 = 110 - 82 * Math.sin(a);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth={1.5}
            />
          );
        })}

        {/* background arc */}
        <path
          d="M 10 110 A 90 90 0 0 1 190 110"
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* progress arc */}
        <motion.path
          d="M 10 110 A 90 90 0 0 1 190 110"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={14}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${arcLen}` }}
          animate={{ strokeDasharray: `${arcLen * p} ${arcLen}` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />

        {/* needle */}
        <motion.g
          initial={false}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 55, damping: 12 }}
          style={{ originX: "100px", originY: "110px" }}
        >
          <line
            x1={100}
            y1={110}
            x2={100}
            y2={32}
            stroke="#e2e8f0"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={100} cy={110} r={6} fill="#e2e8f0" />
        </motion.g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <motion.p
          key={probability.toFixed(2)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl font-semibold tracking-tight"
          style={{ color: riskColor[riskLevel] }}
        >
          {(p * 100).toFixed(1)}
          <span className="text-2xl">%</span>
        </motion.p>
        <span
          className="mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: `${riskColor[riskLevel]}1a`,
            color: riskColor[riskLevel],
            border: `1px solid ${riskColor[riskLevel]}44`,
          }}
        >
          {riskLabel[riskLevel]}
        </span>
      </div>
    </div>
  );
}

export function ContributionBars({
  contributions,
}: {
  contributions: FeatureContribution[];
}) {
  const maxAbs = Math.max(
    0.0001,
    ...contributions.map((c) => Math.abs(c.value)),
  );

  return (
    <div className="space-y-3">
      {contributions.map((c, i) => {
        const pct = Math.min(100, (Math.abs(c.value) / maxAbs) * 100);
        const risk = c.value > 0;
        return (
          <div key={c.key} className="grid grid-cols-[1fr_auto] items-center gap-2">
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-slate-300">
                  {c.label}
                </span>
                <span
                  className={clsx(
                    "text-xs font-semibold tabular-nums",
                    risk ? "text-rose-300" : "text-emerald-300",
                  )}
                >
                  {risk ? "+" : ""}
                  {c.value.toFixed(2)}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-white/[0.06]">
                <span className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct / 2}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
                  className={clsx(
                    "absolute top-0 h-full rounded-full",
                    risk
                      ? "left-1/2 bg-gradient-to-r from-rose-500/70 to-rose-500"
                      : "right-1/2 bg-gradient-to-l from-emerald-500/70 to-emerald-500",
                  )}
                />
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500">{c.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
