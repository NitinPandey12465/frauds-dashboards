"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Menu, X, Sparkles } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze", label: "Live Check" },
  { href: "/transactions", label: "Transactions" },
  { href: "/model", label: "Model" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
            <ShieldCheck className="h-5 w-5 text-white" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Sentinel
            <span className="ml-1.5 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-300">
              Fraud Shield
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-100",
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/10" />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" />
            Scan a transaction
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-ink-900/95 px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "block rounded-lg px-3 py-2.5 text-sm font-medium",
                pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
                  ? "bg-white/[0.06] text-white"
                  : "text-slate-400",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/analyze"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" /> Scan a transaction
          </Link>
        </div>
      )}
    </header>
  );
}
