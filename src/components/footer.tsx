import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <ShieldCheck className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-white">
                Sentinel Fraud Shield
              </p>
              <p className="text-xs text-slate-500">
                Real-time, explainable fraud detection for modern payments.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Demo built on the IEEE-CIS fraud detection pipeline · XGBoost ·
            SHAP · PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
