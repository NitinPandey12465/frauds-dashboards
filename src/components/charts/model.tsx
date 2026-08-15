"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "./dashboard";

function tooltipStyle(): React.CSSProperties {
  return {
    background: "rgba(13,20,36,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 12,
    color: "#fff",
  };
}

function rocCurve(auc: number, steps = 40) {
  const k = auc / (1 - auc);
  const pts: { fpr: number; tpr: number }[] = [{ fpr: 0, tpr: 0 }];
  for (let i = 1; i <= steps; i++) {
    const fpr = i / steps;
    const tpr = 1 - Math.pow(1 - fpr, k);
    pts.push({ fpr, tpr });
  }
  return pts;
}

export function RocCurveChart() {
  const data = useMemo(() => {
    const steps = 40;
    const xg = rocCurve(0.9361, steps);
    const lgb = rocCurve(0.9301, steps);
    const lr = rocCurve(0.7576, steps);
    const merged = Array.from({ length: steps + 1 }, (_, i) => ({
      fpr: xg[i].fpr,
      xg: xg[i].tpr,
      lgb: lgb[i].tpr,
      lr: lr[i].tpr,
    }));
    return merged;
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis
          dataKey="fpr"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: "False positive rate", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value, name) => {
            const v = Number(value);
            const label = String(name) === "xg" ? "XGBoost" : String(name) === "lgb" ? "LightGBM" : "Logistic";
            return [`${(v * 100).toFixed(1)}% TPR`, label];
          }}
          labelFormatter={(v) => `${(Number(v) * 100).toFixed(0)}% FPR`}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        <Line name="xg" type="monotone" dataKey="xg" stroke={CHART_COLORS.indigo} strokeWidth={2.5} dot={false} />
        <Line name="lgb" type="monotone" dataKey="lgb" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} />
        <Line name="lr" type="monotone" dataKey="lr" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function prPoint(fpr: number, k: number, base: number) {
  const tpr = 1 - Math.pow(1 - fpr, k);
  const precision = (base * tpr) / (base * tpr + fpr);
  return { recall: tpr, precision };
}

export function PrCurveChart() {
  const data = useMemo(() => {
    const base = 0.035;
    const steps = 40;
    const kXg = 0.9361 / (1 - 0.9361);
    const kLgb = 0.9301 / (1 - 0.9301);
    const kLr = 0.7576 / (1 - 0.7576);
    const xg: { recall: number; precision: number }[] = [];
    const lgb: { recall: number; precision: number }[] = [];
    const lr: { recall: number; precision: number }[] = [];
    for (let i = 1; i <= steps; i++) {
      const fpr = i / steps;
      xg.push(prPoint(fpr, kXg, base));
      lgb.push(prPoint(fpr, kLgb, base));
      lr.push(prPoint(fpr, kLr, base));
    }
    const merged = xg.map((p, i) => ({
      recall: p.recall,
      xg: p.precision,
      lgb: lgb[i].precision,
      lr: lr[i].precision,
    }));
    return merged;
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis
          dataKey="recall"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Recall", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value, name) => {
            const v = Number(value);
            const label = String(name) === "xg" ? "XGBoost" : String(name) === "lgb" ? "LightGBM" : "Logistic";
            return [`${(v * 100).toFixed(1)}% precision`, label];
          }}
          labelFormatter={(v) => `${(Number(v) * 100).toFixed(0)}% recall`}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        <Line name="xg" type="monotone" dataKey="xg" stroke={CHART_COLORS.indigo} strokeWidth={2.5} dot={false} />
        <Line name="lgb" type="monotone" dataKey="lgb" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} />
        <Line name="lr" type="monotone" dataKey="lr" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ModelCompareChart() {
  const data = [
    { model: "Logistic", prAuc: 0.1678, roc: 0.7576, f1: 0.116, recall: 0.746 },
    { model: "XGBoost", prAuc: 0.6412, roc: 0.9361, f1: 0.361, recall: 0.821 },
    { model: "LightGBM", prAuc: 0.6224, roc: 0.9301, f1: 0.338, recall: 0.82 },
    { model: "XGB + SMOTE", prAuc: 0.5294, roc: 0.8862, f1: 0.519, recall: 0.403 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 1]}
          tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value, name) => {
            const v = Number(value);
            const labels: Record<string, string> = {
              prAuc: "PR-AUC",
              roc: "AUC-ROC",
              f1: "F1",
              recall: "Recall",
            };
            return [`${(v * 100).toFixed(1)}%`, labels[String(name)] ?? String(name)];
          }}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        <Bar dataKey="prAuc" name="PR-AUC" radius={[4, 4, 0, 0]} maxBarSize={16}>
          {data.map((d) => (
            <Cell key={d.model} fill={d.model === "XGBoost" ? CHART_COLORS.rose : "#475569"} />
          ))}
        </Bar>
        <Bar dataKey="roc" name="AUC-ROC" radius={[4, 4, 0, 0]} maxBarSize={16}>
          {data.map((d) => (
            <Cell key={d.model} fill={d.model === "XGBoost" ? CHART_COLORS.indigo : "#334155"} />
          ))}
        </Bar>
        <Bar dataKey="f1" name="F1" radius={[4, 4, 0, 0]} maxBarSize={16}>
          {data.map((d) => (
            <Cell key={d.model} fill={CHART_COLORS.cyan} />
          ))}
        </Bar>
        <Bar dataKey="recall" name="Recall" radius={[4, 4, 0, 0]} maxBarSize={16}>
          {data.map((d) => (
            <Cell key={d.model} fill={CHART_COLORS.violet} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CostCurveChart() {
  const data = [
    { threshold: 0.01, cost: 5950 },
    { threshold: 0.05, cost: 2100 },
    { threshold: 0.1, cost: 1280 },
    { threshold: 0.2, cost: 640 },
    { threshold: 0.3, cost: 410 },
    { threshold: 0.4, cost: 300 },
    { threshold: 0.5, cost: 223 },
    { threshold: 0.57, cost: 213 },
    { threshold: 0.6, cost: 219 },
    { threshold: 0.7, cost: 262 },
    { threshold: 0.8, cost: 330 },
    { threshold: 0.9, cost: 460 },
    { threshold: 0.99, cost: 615 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis
          dataKey="threshold"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Decision threshold", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${Number(v) / 1000}K`}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value) => [`$${(Number(value) * 1000).toLocaleString()}`, "Total cost"]}
          labelFormatter={(v) => `Threshold ${v}`}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke={CHART_COLORS.emerald}
          strokeWidth={2.5}
          dot={{ r: 2, fill: CHART_COLORS.emerald }}
        />
        <ReferenceDot
          x={0.57}
          y={213}
          r={6}
          fill={CHART_COLORS.rose}
          stroke="#fff"
          strokeWidth={2}
          label={{ value: "Optimal 0.57", position: "top", fill: "#f43f5e", fontSize: 11 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
