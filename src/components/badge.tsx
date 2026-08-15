import clsx from "clsx";
import type { RiskLevel } from "@/lib/scoring";

const styles: Record<RiskLevel, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
  medium: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
  high: "bg-orange-500/10 text-orange-300 ring-orange-400/30",
  critical: "bg-rose-500/10 text-rose-300 ring-rose-400/40",
};

const dot: Record<RiskLevel, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-orange-400",
  critical: "bg-rose-400",
};

const label: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel | string;
  className?: string;
}) {
  const lvl = (level ?? "low") as RiskLevel;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[lvl] ?? styles.low,
        className,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", dot[lvl] ?? dot.low)} />
      {label[lvl] ?? level}
    </span>
  );
}

export function FraudBadge({ isFraud }: { isFraud: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        isFraud
          ? "bg-rose-500/10 text-rose-300 ring-rose-400/40"
          : "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          isFraud ? "bg-rose-400" : "bg-emerald-400",
        )}
      />
      {isFraud ? "Fraud" : "Legit"}
    </span>
  );
}
