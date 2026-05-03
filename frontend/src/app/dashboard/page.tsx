"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useProducts } from "@/hooks/use-products";
import { useAlerts } from "@/hooks/use-alerts";
import { UrlForm } from "@/components/url-form";

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const { data: alerts, isLoading: loadingAlerts } = useAlerts();

  const products = productsData?.products ?? [];
  const activeAlerts = alerts?.filter((a) => a.active) ?? [];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Merhaba, {session?.user.name?.split(" ")[0] ?? "kullanıcı"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Takip ettiğin ürünler ve alarmların burada.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Takip edilen ürün"
            value={loadingProducts ? "—" : String(products.length)}
            icon="📦"
          />
          <StatCard
            label="Aktif alarm"
            value={loadingAlerts ? "—" : String(activeAlerts.length)}
            icon="🔔"
          />
          <StatCard
            label="Plan"
            value={(session?.user as { plan?: string })?.plan ?? "free"}
            icon="⚡"
            className="hidden sm:flex capitalize"
          />
        </div>

        {/* Add product */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Ürün Ekle
          </h2>
          <UrlForm />
        </section>

        {/* Recent products */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Takip Edilen Ürünler
            </h2>
            <Link href="/products" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Tümünü gör →
            </Link>
          </div>

          {loadingProducts && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-800/60 border border-slate-700 animate-pulse" />
              ))}
            </div>
          )}

          {!loadingProducts && products.length === 0 && (
            <div className="text-center py-10 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
              Henüz ürün eklenmemiş. Yukarıdan bir URL yapıştır!
            </div>
          )}

          {!loadingProducts && products.length > 0 && (
            <div className="space-y-2">
              {products.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name ?? ""} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{p.name ?? p.url}</p>
                    <p className="text-xs text-slate-400 capitalize">{p.platform}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">
                      {p.latest_price ? fmt.format(p.latest_price.price) : "—"}
                    </p>
                    {p.latest_price?.discount_pct && (
                      <p className="text-xs text-emerald-400">%{p.latest_price.discount_pct.toFixed(0)} indirim</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Aktif Alarmlar
              </h2>
              <Link href="/alerts" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Tümünü gör →
              </Link>
            </div>
            <div className="space-y-2">
              {activeAlerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-400">Hedef: </span>
                    <span className="text-sm font-medium text-white">{fmt.format(a.target_price)}</span>
                  </div>
                  <Link href={`/products/${a.product_id}`} className="text-xs text-slate-400 hover:text-white transition-colors">
                    Ürüne git →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  icon: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700 rounded-xl ${className}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}
