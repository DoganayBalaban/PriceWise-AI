"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Box,
  Bot,
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
import { AlertButton } from "@/components/alert-button";
import { CompareCard } from "@/components/compare-card";
import { DecisionCard } from "@/components/decision-card";
import { ForecastCard } from "@/components/forecast-card";
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

function ProductThumb({ name, imageUrl, size = 80 }: { name: string; imageUrl?: string | null; size?: number }) {
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
      <Box size={size * 0.4} style={{ color: `hsl(${hue} 60% 35%)` }} />
    </div>
  );
}

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useProduct(id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: refreshProduct, isPending: isRefreshing } = useRefreshProduct();

  /* ── Loading ─────────────────────────────── */
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-start gap-5">
          <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────── */
  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-20">
        <p className="text-destructive mb-4">{(error as Error).message}</p>
        <Link href="/products" className="text-primary hover:underline text-sm">
          ← Ürünlere dön
        </Link>
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

  /* ── Render ──────────────────────────────── */
  return (
    <div className="p-6 max-w-7xl mx-auto fade-in space-y-6">

      {/* Back link */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Ürünlerim
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <ProductThumb name={data.name ?? data.url} imageUrl={data.image_url} size={80} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <PlatformBadge platform={data.platform} />
            {data.category && (
              <Badge variant="outline" className="text-[10px]">{data.category}</Badge>
            )}
            {price && (
              <Badge
                variant="outline"
                className={`text-[10px] ${price.in_stock ? "border-success/30 text-success" : "border-destructive/30 text-destructive"}`}
              >
                {price.in_stock ? "✓ Stokta" : "Stok yok"}
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight leading-snug mb-1">
            {data.name ?? data.url}
          </h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {data.brand && <span>{data.brand}</span>}
            {price && (
              <span>
                Son güncelleme:{" "}
                {new Date(price.scraped_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <AlertButton productId={id} currentPrice={price?.price ?? 0} />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            Güncelle
          </button>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — chart + forecast */}
        <div className="lg:col-span-2 space-y-6">

          {/* Micro stats */}
          {price && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MicroStat
                label="Mevcut fiyat"
                value={fmt.format(price.price)}
                sub={price.discount_pct ? `%${price.discount_pct.toFixed(0)} indirimli` : undefined}
                tone={price.discount_pct ? "success" : undefined}
              />
              <MicroStat
                label="Orijinal fiyat"
                value={price.original_price ? fmt.format(price.original_price) : "—"}
              />
              <MicroStat label="Platform" value={PLATFORM_COLORS[data.platform]?.label ?? data.platform} />
              <MicroStat
                label="Stok durumu"
                value={price.in_stock ? "Stokta" : "Tükendi"}
                tone={price.in_stock ? "success" : "danger"}
              />
            </div>
          )}

          {/* Price history chart */}
          <PriceChart productId={id} />

          {/* Forecast */}
          <ForecastCard productId={id} />

          {/* Compare */}
          <CompareCard productId={id} />
        </div>

        {/* Right col — decision + sentiment + quick actions */}
        <div className="space-y-4">
          <DecisionCard productId={id} />
          <SentimentCard productId={id} />

          {/* Quick actions */}
          <Card className="p-2">
            {[
              { icon: MessageSquare, label: "Yorumlara sor", href: "#chat" },
              { icon: Sparkles,      label: "AI yorum özeti", href: "#summary" },
              { icon: Layers,        label: "Platform karşılaştır", href: "#compare" },
              { icon: Bot,           label: "Karar agent'ı", href: "#decision" },
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

      {/* Full-width sections */}
      <div id="summary">
        <SummaryCard productId={id} />
      </div>
      <div id="chat">
        <ReviewChat productId={id} />
      </div>
    </div>
  );
}

function MicroStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "danger";
}) {
  const subColor =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      <div className="text-base font-semibold">{value}</div>
      {sub && <div className={`text-[10px] mt-0.5 ${subColor}`}>{sub}</div>}
    </Card>
  );
}
