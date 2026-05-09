"use client";

import Link from "next/link";
import { Activity, Bell, Box, ChevronRight, Plus, Sparkles, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useProducts } from "@/hooks/use-products";
import { useAlerts } from "@/hooks/use-alerts";
import { UrlForm } from "@/components/url-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  trendyol:    { bg: "hsl(15 100% 95%)",  text: "hsl(15 100% 40%)",  label: "Trendyol"    },
  hepsiburada: { bg: "hsl(35 100% 94%)",  text: "hsl(28 95% 40%)",   label: "Hepsiburada" },
  n11:         { bg: "hsl(295 70% 95%)",  text: "hsl(295 70% 40%)",  label: "n11"         },
};

function PlatformBadge({ platform }: { platform: string }) {
  const p = PLATFORM_COLORS[platform] ?? { bg: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))", label: platform };
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: p.bg, color: p.text }}
    >
      {p.label}
    </span>
  );
}

function ProductThumb({ name, size = 44 }: { name: string; size?: number }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue} 60% 92%), hsl(${(hue + 40) % 360} 60% 88%))`,
      }}
    >
      <Box size={size * 0.45} style={{ color: `hsl(${hue} 60% 35%)` }} />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const { data: alerts, isLoading: loadingAlerts } = useAlerts();

  const products = productsData?.products ?? [];
  const activeAlerts = alerts?.filter((a) => a.active) ?? [];
  const plan = (session?.user as { plan?: string })?.plan ?? "free";
  const quotaLimit = plan === "business" ? 9999 : plan === "pro" ? 100 : 5;
  const firstName = session?.user.name?.split(" ")[0] ?? "kullanıcı";

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hoş geldin, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length > 0
              ? `${products.length} ürün takip ediliyor.`
              : "Henüz ürün eklemedin. Aşağıdan bir URL yapıştır!"}
          </p>
        </div>
        <Link
          href="/products/add"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Ürün ekle
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Takip edilen ürün"
          value={loadingProducts ? null : String(products.length)}
          icon={<Box size={16} />}
        />
        <StatCard
          label="Aktif alarm"
          value={loadingAlerts ? null : String(activeAlerts.length)}
          icon={<Bell size={16} />}
        />
        <StatCard
          label="Bu ay tasarruf"
          value="₺0"
          icon={<TrendingDown size={16} />}
          sub="Henüz hesaplanıyor"
        />
        <StatCard
          label="Aylık kota"
          value={quotaLimit === 9999 ? "Sınırsız" : `0/${quotaLimit}`}
          icon={<Activity size={16} />}
        />
      </div>

      {/* AI insight banner */}
      <Card
        className="p-4 flex items-center gap-4"
        style={{
          background: "hsl(var(--primary) / 0.04)",
          borderColor: "hsl(var(--primary) / 0.25)",
        }}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">AI önerisi hazır</div>
          <div className="text-xs text-muted-foreground">
            Ürünlerini analiz etmek için bir URL yapıştır — Prophet tahmin modeli fiyat düşüşlerini önceden bildirir.
          </div>
        </div>
        <Link
          href="/products"
          className="shrink-0 inline-flex items-center h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
        >
          Ürünleri gör
        </Link>
      </Card>

      {/* Add product */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Ürün Ekle
        </h2>
        <UrlForm />
      </section>

      {/* Products table */}
      <Card className="overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">Takip ettiğin ürünler</h2>
            {!loadingProducts && (
              <Badge variant="outline" className="text-[10px]">
                {products.length}
              </Badge>
            )}
          </div>
          <Link href="/products" className="text-xs text-primary hover:underline">
            Tümünü gör →
          </Link>
        </div>

        {/* Loading state */}
        {loadingProducts && (
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingProducts && products.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Box size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">Henüz ürün yok</p>
            <p className="text-xs text-muted-foreground">
              Yukarıdaki forma bir ürün URL&apos;si yapıştırarak başla.
            </p>
          </div>
        )}

        {/* Product rows */}
        {!loadingProducts && products.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground text-left">
                <th className="px-4 py-2.5 font-medium">Ürün</th>
                <th className="px-4 py-2.5 font-medium">Fiyat</th>
                <th className="px-4 py-2.5 font-medium hidden sm:table-cell">İndirim</th>
                <th className="px-4 py-2.5 font-medium hidden md:table-cell">Platform</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 8).map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => (window.location.href = `/products/${p.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover shrink-0 bg-muted"
                        />
                      ) : (
                        <ProductThumb name={p.name ?? p.url} />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate max-w-[200px]">
                          {p.name ?? p.url}
                        </div>
                        {p.brand && (
                          <div className="text-xs text-muted-foreground">{p.brand}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold">
                      {p.latest_price ? fmt.format(p.latest_price.price) : "—"}
                    </div>
                    {p.latest_price?.original_price && (
                      <div className="text-xs text-muted-foreground line-through">
                        {fmt.format(p.latest_price.original_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.latest_price?.discount_pct ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                        <TrendingDown size={11} />
                        %{p.latest_price.discount_pct.toFixed(0)} indirim
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <PlatformBadge platform={p.platform} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={16} className="text-muted-foreground inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Active alerts */}
      {!loadingAlerts && activeAlerts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aktif Alarmlar
            </h2>
            <Link href="/alerts" className="text-xs text-primary hover:underline">
              Tümünü gör →
            </Link>
          </div>
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-xs text-muted-foreground">Hedef:</span>
                  <span className="text-sm font-medium">{fmt.format(a.target_price)}</span>
                </div>
                <Link
                  href={`/products/${a.product_id}`}
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ürüne git →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upgrade nudge for free plan */}
      {plan === "free" && (
        <Card className="p-4 flex items-center gap-4 border-warning/20 bg-warning/5">
          <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
            <Zap size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Pro&apos;ya geç</div>
            <div className="text-xs text-muted-foreground">
              Aylık 100 analiz, RAG yorum sorgusu ve LangGraph karar agent&apos;ı için Pro planını dene.
            </div>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center h-8 px-3 rounded-lg bg-warning text-white text-xs font-medium hover:bg-warning/90 transition-colors"
          >
            Planları gör
          </Link>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </div>
      {value === null ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
      )}
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}
