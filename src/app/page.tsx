import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Brain,
  ShieldCheck,
  Radar,
  Scale,
  Zap,
  ScanLine,
  Cpu,
  TrendingUp,
  Smartphone,
  Clock,
  Package,
  Layers,
} from "lucide-react";
import { HeroVisual } from "@/components/hero-visual";
import { Reveal } from "@/components/reveal";

const stats = [
  { value: "590,540", label: "transactions analyzed", suffix: "" },
  { value: "3.5%", label: "network fraud rate", suffix: "" },
  { value: "78.4%", label: "of fraud caught early", suffix: "" },
  { value: "$402K", label: "net value protected / batch", suffix: "" },
];

const features = [
  {
    icon: Zap,
    title: "Millisecond scoring",
    body: "Every payment is scored in real time — before it completes — so fraud is stopped before funds move.",
  },
  {
    icon: Brain,
    title: "Explainable decisions",
    body: "SHAP-driven explanations show exactly why a transaction is flagged. No black boxes, no mystery declines.",
  },
  {
    icon: Scale,
    title: "Cost-aware thresholds",
    body: "We tune decisions to real money: $149 per missed fraud vs $10 per false alarm — maximizing net value.",
  },
  {
    icon: Radar,
    title: "Velocity & behavior signals",
    body: "Card velocity, unusual spend ratios, and device fingerprints catch card-testing and account takeover.",
  },
  {
    icon: Activity,
    title: "Live risk intelligence",
    body: "Fraud by category, device, and hour of day — surfaced so risk teams act on patterns, not noise.",
  },
  {
    icon: ShieldCheck,
    title: "Customer-first protection",
    body: "Block fraud without blocking good customers. Step-up auth and second-channel verification protect trust.",
  },
];

const insights = [
  {
    icon: Package,
    stat: "11.69%",
    title: "Category C fraud rate",
    body: "Digital goods & gift cards show 3.3× the network average — a top target for carding.",
    accent: "from-rose-500/20 to-pink-600/5 text-rose-300",
  },
  {
    icon: Smartphone,
    stat: "1.56×",
    title: "Mobile risk premium",
    body: "Mobile-originated payments carry 1.56× the fraud risk of desktop transactions.",
    accent: "from-violet-500/20 to-indigo-600/5 text-violet-300",
  },
  {
    icon: Clock,
    stat: "7 AM",
    title: "The bot window",
    body: "Fraud peaks at 7 AM with a 10.61% rate — automated attacks under low human monitoring.",
    accent: "from-cyan-500/20 to-sky-600/5 text-cyan-300",
  },
];

const steps = [
  {
    icon: ScanLine,
    step: "01",
    title: "Capture signals",
    body: "Amount, category, device, card, email domain, time, velocity, and 200+ engineered features per transaction.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Score with gradient boosting",
    body: "A calibrated XGBoost model (PR-AUC 0.64) computes fraud probability in log-odds space.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Decide & explain",
    body: "The system blocks, challenges, or approves — and returns a human-readable reason for every call.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="grid-fade absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                IEEE-CIS validated · XGBoost + SHAP
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Stop fraud before it hurts{" "}
                <span className="text-gradient">your customers.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                Sentinel scores every transaction in milliseconds, explains
                exactly <span className="text-slate-200">why</span> it&apos;s
                flagged, and balances risk against customer trust — so you block
                fraud without blocking good customers.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/analyze"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:brightness-110"
                >
                  <ScanLine className="h-4 w-4" />
                  Scan a transaction
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  <TrendingUp className="h-4 w-4" />
                  Explore the dashboard
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                {[
                  "Real-time scoring",
                  "Explainable AI",
                  "Cost-aware decisions",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="relative lg:pl-6">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="px-4 py-8 text-center">
              <p className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1.5 text-sm text-slate-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Why Sentinel
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fraud defense your customers never notice
          </h2>
          <p className="mt-4 text-slate-400">
            A payment security platform that protects revenue and reputation —
            while keeping checkout fast and friction-free.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07}>
              <div className="glass group h-full rounded-2xl p-6 transition hover:border-white/20">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/10 ring-1 ring-inset ring-white/10 transition group-hover:scale-105">
                  <f.icon className="h-5 w-5 text-indigo-300" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Insights */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Headline findings
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fraud hides in predictable places
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {insights.map((ins, i) => (
            <Reveal key={ins.title} delay={i * 0.08}>
              <div className="glass relative overflow-hidden rounded-2xl p-6">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl" />
                <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${ins.accent}`}>
                  <ins.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-white">
                  {ins.stat}
                </p>
                <h3 className="mt-1.5 font-semibold text-white">{ins.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {ins.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From raw transaction to confident decision
          </h2>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="glass relative rounded-2xl p-6">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
                  <s.icon className="h-6 w-6 text-white" />
                </span>
                <p className="mt-4 font-display text-sm font-semibold tracking-widest text-indigo-300">
                  STEP {s.step}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16">
            <div className="grid-fade absolute inset-0 -z-10 opacity-60" />
            <div className="absolute -top-24 left-1/2 h-64 w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />
            <Layers className="mx-auto h-10 w-10 text-indigo-300" />
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to protect your customers from the next fraud wave?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Run any transaction through Sentinel&apos;s live explainable
              scanner and see exactly how the decision is made.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/analyze"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:brightness-110"
              >
                Start a live scan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/model"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                View model performance
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
