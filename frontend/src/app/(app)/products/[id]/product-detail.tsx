"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  Box,
  Brain,
  ChevronRight,
  ExternalLink,
  Layers,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useProduct, useDeleteProduct, useRefreshProduct } from "@/hooks/use-products";
import { usePriceStats } from "@/hooks/use-price-history";
import { useForecast } from "@/hooks/use-forecast";
import { AlertButton } from "@/components/alert-button";
import { CompareCard } from "@/components/compare-card";
import { DecisionCard } from "@/components/decision-card";
import { PriceChart } from "@/components/price-chart";
import { ReviewChat } from "@/components/review-chat";
import { SentimentCard } from "@/components/sentiment-card";
import { SummaryCard } from "@/components/summary-card";
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
  const p = PLATFORM_COLORS[platform] ?? {
    bg: "hsl(var(--muted))",
    text: "hsl(var(--muted-foreground))",
    label: platform,
  };
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: p.bg, color: p.text }}
    >
      {p.label}
    </span>
  );
}

function ProductThumb({ name, imageUrl, size = 96 }: { name: string; imageUrl?: string | null; size?: number }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageUrl}
        alt=""
        className="rounded-xl object-cover shrink-0 bg-muted border border-border"
        style={{ width: size, height: size }}
      />
    );
  }
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0 border border-border"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue} 60% 92%), hsl(${(hue + 40) % 360} 60% 88%))`,
      }}
    >
      <Box size={size * 0.38} style={{ color: `hsl(${hue} 60% 35%)` }} />
    </div>
  );
}

function MicroStat({
  label,
  value,
  sub,
  tone,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "muted";
  loading?: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-5 w-20 mt-1" />
      ) : (
        <div className="text-lg font-semibold">{value}</div>
      )}
      {sub && !loading && (
        <div className={`text-[10px] mt-0.5 ${tone === "success" ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
          {sub}
        </div>
      )}
    </Card>
  );
}

function ModelInsightCard({ productId }: { productId: string }) {
  const { data, isLoading } = useForecast(productId, 7);

  if (isLoading) return <Skeleton className="h-28 rounded-xl" />;
  if (!data) return null;

  const diff = data.predicted_final_price - data.current_price;
  const pct = ((diff / data.current_price) * 100).toFixed(1);
  const rising = diff > 0;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Brain size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-sm">Model yorumu</h4>
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              prophet-v2
            </span>
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              MAE: {fmt.format(data.mae)}
            </span>
            {data.low_confidence && (
              <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                Düşük güven
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rising
              ? `7 günlük tahmin, fiyatın ${fmt.format(data.predicted_final_price)}'a yükselebileceğini gösteriyor `
              : `7 günlük tahmin, fiyatın ${fmt.format(data.predicted_final_price)}'a düşebileceğini gösteriyor `}
            (<span className={`font-medium ${rising ? "text-destructive" : "text-[hsl(var(--success))]"}`}>
              {rising ? "+" : ""}{pct}%
            </span>
            {" · "}
            {rising ? "fiyat artış beklentisi" : `~${fmt.format(Math.abs(diff))} tasarruf`}).{" "}
            {data.recommendation === "AL"
              ? "Model şu an almanın avantajlı olduğunu öngörüyor."
              : data.recommendation === "BEKLE"
              ? "Birkaç gün beklemek daha avantajlı olabilir."
              : "Alternatif platformları da değerlendirmeni öneriyor."}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useProduct(id);
  const { data: stats, isLoading: statsLoading } = usePriceStats(id, 30);
  const { data: forecast7, isLoading: forecastLoading } = useForecast(id, 7);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: refreshProduct, isPending: isRefreshing } = useRefreshProduct();

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-start gap-6">
          <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="flex gap-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-16" /></div>
            <Skeleton className="h-7 w-80" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (isError) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-20">
        <p className="text-destructive mb-4">{(error as Error).message}</p>
        <Link href="/products" className="text-primary hover:underline text-sm">← Ürünlere dön</Link>
      </div>
    );
  }

  if (!data) return null;

  const price = data.latest_price;

  function handleRefresh() {
    refreshProduct(id, {
      onSuccess: () => toast.success("Fiyat güncellendi"),
      onError: (err: Error) => toast.error(err.message),
    });
  }

  function handleDelete() {
    deleteProduct(id, {
      onSuccess: () => {
        toast.success("Ürün takip listesinden çıkarıldı");
        router.push("/products");
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  const discountPct = price?.discount_pct;

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">

      {/* ── Header ── */}
      <div className="flex items-start gap-6 mb-6">
        <ProductThumb name={data.name ?? data.url} imageUrl={data.image_url} size={96} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PlatformBadge platform={data.platform} />
            {data.category && (
              <Badge variant="outline" className="text-[10px]">{data.category}</Badge>
            )}
            {price && (
              <Badge
                variant="outline"
                className={`text-[10px] ${price.in_stock ? "border-[hsl(var(--success)/0.4)] text-[hsl(var(--success))]" : "border-destructive/30 text-destructive"}`}
              >
                {price.in_stock ? "✓ Stokta" : "Stok yok"}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight leading-snug mb-1">
            {data.name ?? data.url}
          </h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {data.brand && <span>{data.brand}</span>}
            {price && (
              <span>
                Son güncelleme:{" "}
                {new Date(price.scraped_at).toLocaleString("tr-TR", {
                  day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <AlertButton productId={id} currentPrice={price?.price ?? 0} />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Fiyatı güncelle"
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {isRefreshing
              ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <RefreshCw size={14} />}
          </button>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Platformda aç"
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Takibi bırak"
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            {isDeleting
              ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <MicroStat
              label="Mevcut"
              value={price ? fmt.format(price.price) : "—"}
              sub={discountPct ? `%${discountPct.toFixed(0)} indirimli` : undefined}
              tone={discountPct ? "success" : undefined}
            />
            <MicroStat
              label="30g ort."
              value={stats?.avg_price != null ? fmt.format(stats.avg_price) : "—"}
              loading={statsLoading}
            />
            <MicroStat
              label="En düşük"
              value={stats?.min_price != null ? fmt.format(stats.min_price) : "—"}
              loading={statsLoading}
            />
            <MicroStat
              label="7g tahmin"
              value={forecast7?.predicted_final_price != null ? fmt.format(forecast7.predicted_final_price) : "—"}
              sub={
                forecast7 && price
                  ? `${forecast7.predicted_final_price < price.price ? "−" : "+"}${fmt.format(Math.abs(forecast7.predicted_final_price - price.price))}`
                  : undefined
              }
              tone={forecast7 && price && forecast7.predicted_final_price < price.price ? "success" : undefined}
              loading={forecastLoading}
            />
          </div>

          {/* Price chart */}
          <PriceChart productId={id} />

          {/* Model insight */}
          <ModelInsightCard productId={id} />
        </div>

        {/* Right col */}
        <div className="space-y-4">

          {/* Decision card */}
          <div id="decision">
            <DecisionCard productId={id} />
          </div>

          {/* Sentiment */}
          <div id="sentiment">
            <SentimentCard productId={id} />
          </div>

          {/* Quick actions */}
          <Card className="p-2">
            {[
              { icon: MessageSquare, label: "Yorumlara sor",       href: "#chat" },
              { icon: Sparkles,      label: "AI yorum özeti",      href: "#summary" },
              { icon: Layers,        label: "Platform karşılaştır", href: "#compare" },
              { icon: Bot,           label: "Karar agent'ı",        href: "#decision" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="w-full flex items-center gap-3 px-3 h-10 rounded-md hover:bg-muted text-sm transition-colors"
              >
                <Icon size={14} className="text-primary shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </a>
            ))}
          </Card>
        </div>
      </div>

      {/* ── Full-width sections ── */}
      <div className="mt-6 space-y-6">
        <div id="compare">
          <CompareCard productId={id} />
        </div>
        <div id="summary">
          <SummaryCard productId={id} />
        </div>
        <div id="chat">
          <ReviewChat productId={id} />
        </div>
      </div>
    </div>
  );
}
