"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  Activity,
  ShieldAlert,
  BadgeDollarSign,
  Target,
  GaugeCircle,
  GitCompareArrows,
  Scale,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  "shield-alert": ShieldAlert,
  dollar: BadgeDollarSign,
  target: Target,
  gauge: GaugeCircle,
  compare: GitCompareArrows,
  scale: Scale,
};

export type StatIcon = keyof typeof iconMap;
export type StatFormat = "number" | "currency" | "percent" | "decimal";

function formatValue(n: number, format: StatFormat, digits: number): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
    case "percent":
      return `${n.toFixed(digits)}%`;
    case "decimal":
      return n.toFixed(digits);
    case "number":
    default:
      return Math.round(n).toLocaleString("en-US");
  }
}

export function StatCard({
  label,
  value,
  format = "number",
  digits = 1,
  icon,
  accent = "indigo",
  hint,
}: {
  label: string;
  value: number;
  format?: StatFormat;
  digits?: number;
  icon: StatIcon;
  accent?: "indigo" | "emerald" | "rose" | "cyan";
  hint?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  const accents: Record<string, string> = {
    indigo: "from-indigo-500/20 to-violet-600/10 text-indigo-300",
    emerald: "from-emerald-500/20 to-teal-600/10 text-emerald-300",
    rose: "from-rose-500/20 to-pink-600/10 text-rose-300",
    cyan: "from-cyan-500/20 to-sky-600/10 text-cyan-300",
  };

  const Icon = iconMap[icon] ?? Activity;

  return (
    <div ref={ref} className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white tabular-nums">
            {formatValue(display, format, digits)}
          </p>
          {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        </div>
        <span
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10",
            accents[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
