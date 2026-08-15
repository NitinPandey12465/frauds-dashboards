"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

export const CHART_COLORS = {
  indigo: "#6366f1",
  violet: "#a78bfa",
  cyan: "#22d3ee",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  orange: "#fb923c",
  slate: "#64748b",
};

function TooltipShell({
  label,
  items,
}: {
  label: React.ReactNode;
  items: { name: string; value: string; color: string }[];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/95 px-3 py-2.5 text-xs shadow-2xl backdrop-blur">
      <p className="mb-1.5 font-semibold text-white">{label}</p>
      <div className="space-y-1">
        {items.map((it) => (
          <div key={it.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: it.color }}
            />
            <span className="text-slate-400">{it.name}</span>
            <span className="ml-auto font-semibold text-white">
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryBar({
  data,
}: {
  data: { productCd: string; rate: number; fraud: number; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="productCd"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.06)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload;
            return (
              <TooltipShell
                label={`Category ${p.productCd}`}
                items={[
                  { name: "Fraud rate", value: `${p.rate.toFixed(2)}%`, color: CHART_COLORS.rose },
                  { name: "Fraud cases", value: `${p.fraud}`, color: CHART_COLORS.rose },
                  { name: "Total", value: `${p.count}`, color: CHART_COLORS.indigo },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((d) => (
            <Cell
              key={d.productCd}
              fill={
                d.productCd === "C" ? CHART_COLORS.rose : CHART_COLORS.indigo
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DeviceDonut({
  data,
}: {
  data: { device: string; fraud: number; rate: number }[];
}) {
  const total = data.reduce((a, d) => a + d.fraud, 0) || 1;
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="fraud"
            nameKey="device"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={3}
            stroke="none"
            cornerRadius={6}
          >
            {data.map((d) => (
              <Cell
                key={d.device}
                fill={d.device === "mobile" ? CHART_COLORS.rose : CHART_COLORS.cyan}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <TooltipShell
                  label={p.device === "mobile" ? "Mobile" : "Desktop"}
                  items={[
                    { name: "Fraud cases", value: `${p.fraud}`, color: CHART_COLORS.rose },
                    { name: "Share", value: `${((p.fraud / total) * 100).toFixed(1)}%`, color: CHART_COLORS.cyan },
                    { name: "Fraud rate", value: `${p.rate.toFixed(2)}%`, color: CHART_COLORS.rose },
                  ]}
                />
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-2xl font-semibold text-white">
          {data.reduce((a, d) => a + d.fraud, 0)}
        </p>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">
          fraud cases
        </p>
      </div>
    </div>
  );
}

export function HourArea({
  data,
}: {
  data: { hour: number; rate: number; fraud: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}:00`}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload;
            return (
              <TooltipShell
                label={`${p.hour}:00`}
                items={[
                  { name: "Fraud rate", value: `${p.rate.toFixed(2)}%`, color: CHART_COLORS.rose },
                  { name: "Fraud cases", value: `${p.fraud}`, color: CHART_COLORS.rose },
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#f43f5e"
          strokeWidth={2.5}
          fill="url(#fraudGrad)"
          activeDot={{ r: 4, fill: "#f43f5e", stroke: "#fff", strokeWidth: 1 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CardBar({
  data,
}: {
  data: { cardType: string; fraud: number; rate: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="cardType"
          tick={{ fill: "#e2e8f0", fontSize: 12 }}
          tickFormatter={(v) =>
            String(v).charAt(0).toUpperCase() + String(v).slice(1)
          }
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.06)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload;
            return (
              <TooltipShell
                label={p.cardType}
                items={[
                  { name: "Fraud cases", value: `${p.fraud}`, color: CHART_COLORS.rose },
                  { name: "Fraud rate", value: `${p.rate.toFixed(2)}%`, color: CHART_COLORS.rose },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="fraud" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((d) => (
            <Cell
              key={d.cardType}
              fill={d.cardType === "discover" ? CHART_COLORS.rose : CHART_COLORS.violet}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AmountBars({
  data,
}: {
  data: { label: string; count: number; fraud: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.06)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload;
            return (
              <TooltipShell
                label={p.label}
                items={[
                  { name: "Transactions", value: `${p.count}`, color: CHART_COLORS.indigo },
                  { name: "Fraud", value: `${p.fraud}`, color: CHART_COLORS.rose },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((d) => (
            <Cell key={d.label} fill={CHART_COLORS.indigo} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RiskDonut({
  data,
}: {
  data: { riskLevel: string; count: number }[];
}) {
  const colorMap: Record<string, string> = {
    low: CHART_COLORS.emerald,
    medium: CHART_COLORS.amber,
    high: CHART_COLORS.orange,
    critical: CHART_COLORS.rose,
  };
  const total = data.reduce((a, d) => a + d.count, 0) || 1;
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="riskLevel"
            innerRadius="58%"
            outerRadius="86%"
            paddingAngle={3}
            stroke="none"
            cornerRadius={6}
          >
            {data.map((d) => (
              <Cell key={d.riskLevel} fill={colorMap[d.riskLevel] ?? CHART_COLORS.slate} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <TooltipShell
                  label={p.riskLevel}
                  items={[
                    { name: "Count", value: `${p.count}`, color: colorMap[p.riskLevel] },
                    { name: "Share", value: `${((p.count / total) * 100).toFixed(1)}%`, color: colorMap[p.riskLevel] },
                  ]}
                />
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-2xl font-semibold text-white">{total}</p>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">
          scored
        </p>
      </div>
    </div>
  );
}

export function Sparkline({ data, color = CHART_COLORS.cyan }: { data: { v: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
