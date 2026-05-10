"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Box,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductResponse } from "@/types/product";

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

function ProductThumb({
  name,
  imageUrl,
  size = 48,
}: {
  name: string;
  imageUrl?: string | null;
  size?: number;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageUrl}
        alt=""
        className="rounded-lg object-cover shrink-0 bg-muted"
        style={{ width: size, height: size }}
      />
    );
  }
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0"
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

export default function ProductsPage() {
  const { data, isLoading } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("all");

  const products = data?.products ?? [];

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platform === "all" || p.platform === platform;
    return matchSearch && matchPlatform;
  });

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteProduct(id, { onSettled: () => setDeletingId(null) });
  }

  const platforms = ["all", ...Array.from(new Set(products.map((p) => p.platform)))];

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ürünlerim</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Takip ettiğin ürünleri yönet ve yeni ürün ekle.
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Ürün, marka..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          {platforms.map((pl) => (
            <button
              key={pl}
              onClick={() => setPlatform(pl)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                platform === pl
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {pl === "all" ? "Tümü" : (PLATFORM_COLORS[pl]?.label ?? pl)}
            </button>
          ))}
        </div>

        {!isLoading && (
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} ürün</span>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-56" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Box size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">
              {search || platform !== "all" ? "Sonuç bulunamadı" : "Henüz ürün yok"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search || platform !== "all"
                ? "Farklı bir arama veya filtre dene."
                : "\"Ürün Ekle\" sayfasından bir ürün URL'si yapıştırarak başla."}
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground text-left border-b border-border">
                <th className="px-4 py-3 font-medium">Ürün</th>
                <th className="px-4 py-3 font-medium">Fiyat</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">İndirim</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Stok</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Eklenme</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onDelete={() => handleDelete(p.id)}
                  isDeleting={deletingId === p.id && isDeleting}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function ProductRow({
  product: p,
  onDelete,
  isDeleting,
}: {
  product: ProductResponse;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-t border-border hover:bg-muted/40 transition-colors group">
      <td className="px-4 py-3">
        <Link href={`/products/${p.id}`} className="flex items-center gap-3">
          <ProductThumb name={p.name ?? p.url} imageUrl={p.image_url} size={48} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <PlatformBadge platform={p.platform} />
            </div>
            <div className="text-sm font-medium truncate max-w-[200px]">
              {p.name ?? p.url}
            </div>
            {p.brand && (
              <div className="text-xs text-muted-foreground">{p.brand}</div>
            )}
          </div>
        </Link>
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
            %{p.latest_price.discount_pct.toFixed(0)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        {p.latest_price ? (
          <Badge
            variant="outline"
            className={`text-[10px] ${
              p.latest_price.in_stock
                ? "border-success/30 text-success"
                : "border-destructive/30 text-destructive"
            }`}
          >
            {p.latest_price.in_stock ? "Stokta" : "Tükendi"}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {new Date(p.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Sayfayı aç"
          >
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            title="Sil"
          >
            {isDeleting ? (
              <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin block" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
          <Link
            href={`/products/${p.id}`}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      </td>
    </tr>
  );
}
