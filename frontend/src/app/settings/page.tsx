"use client";

import { toast } from "sonner";
import { useMe, usePortal } from "@/hooks/use-me";

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-slate-700 text-slate-300" },
  pro: { label: "Pro", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  business: { label: "Business", color: "bg-purple-500/20 text-purple-400 border border-purple-500/30" },
};

const fmt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function SettingsPage() {
  const { data: me, isLoading } = useMe();
  const { mutate: openPortal, isPending: isPortalPending } = usePortal();

  function handlePortal() {
    openPortal(undefined, {
      onError: (err: Error) => toast.error(err.message),
    });
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-32" />
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl h-48" />
      </main>
    );
  }

  if (!me) return null;

  const plan = PLAN_LABELS[me.plan] ?? PLAN_LABELS.free;
  const quotaPct = me.queries_limit > 0 ? Math.min((me.queries_used / me.queries_limit) * 100, 100) : 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-white">Ayarlar</h1>

      {/* Account */}
      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Hesap</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">{me.name ?? "—"}</p>
            <p className="text-sm text-slate-400">{me.email}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.color}`}>
            {plan.label}
          </span>
        </div>
      </section>

      {/* Quota */}
      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Kota</h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">AI Analiz</span>
            <span className="text-white">
              {me.queries_used} / {me.queries_limit}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaPct >= 90 ? "bg-red-500" : quotaPct >= 70 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${quotaPct}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Takip Edilen Ürün</span>
            <span className="text-white">
              {me.product_count} / {me.product_limit === -1 ? "∞" : me.product_limit}
            </span>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Abonelik</h2>

        {me.plan === "free" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Pro&apos;ya geçerek daha fazla analiz ve ürün takibi yapabilirsin.
            </p>
            <div className="flex gap-2">
              <a
                href="/dashboard"
                className="flex-1 text-center text-sm py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Pro&apos;ya Geç — ₺199/ay
              </a>
              <a
                href="/dashboard"
                className="flex-1 text-center text-sm py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Business — ₺799/ay
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{plan.label} Plan</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Plan değişikliği veya iptal için Lemon Squeezy portalına git.
              </p>
            </div>
            <button
              onClick={handlePortal}
              disabled={isPortalPending}
              className="text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPortalPending && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Aboneliği Yönet ↗
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
