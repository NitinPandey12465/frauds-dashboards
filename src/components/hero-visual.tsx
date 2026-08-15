"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Smartphone, Clock, BadgeDollarSign } from "lucide-react";
import { FraudGauge } from "./score-display";

const chips = [
  {
    icon: Smartphone,
    label: "Mobile origin",
    value: "1.56× risk",
    className: "left-[-12%] top-8",
    delay: 0.2,
  },
  {
    icon: Clock,
    label: "06:47 AM",
    value: "Bot window",
    className: "right-[-10%] top-1/4",
    delay: 0.4,
  },
  {
    icon: BadgeDollarSign,
    label: "Category C",
    value: "$1,249.00",
    className: "left-[-8%] bottom-16",
    delay: 0.6,
  },
];

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-rose-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Live scan · TX-9F2K4Q
            </span>
          </div>
          <ShieldAlert className="h-5 w-5 text-rose-400" />
        </div>

        <div className="mt-2">
          <FraudGauge probability={0.874} riskLevel="critical" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { k: "Amount", v: "$1,249" },
            { k: "Device", v: "Mobile" },
            { k: "Product", v: "Cat. C" },
          ].map((r) => (
            <div
              key={r.k}
              className="rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-inset ring-white/10"
            >
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {r.k}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">{r.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2.5 ring-1 ring-inset ring-rose-400/30">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-300" />
          <p className="text-xs text-rose-200">
            <span className="font-semibold">Blocked</span> — disposable email +
            early-morning + Category C. Customer verified via 3-D Secure.
          </p>
        </div>
      </motion.div>

      {chips.map((c) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + c.delay, type: "spring", stiffness: 200, damping: 16 }}
          className={`glass animate-float absolute ${c.className} hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex`}
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06]">
            <c.icon className="h-4 w-4 text-indigo-300" />
          </span>
          <span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              {c.label}
            </span>
            <span className="block text-sm font-semibold text-white">
              {c.value}
            </span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}
