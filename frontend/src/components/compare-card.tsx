"use client";

import { useCompare } from "@/hooks/use-compare";
import type { PlatformPrice } from "@/types/comparison";
import { Card } from "@/components/ui/card";

interface CompareCardProps {
  productId: string;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  trendyol: {
    label: "Trendyol",
    color: "bg-orange-500/20 text-orange-500 border border-orange-500/30",
  },
  hepsiburada: {
    label: "Hepsiburada",
    color: "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30",
  },
};

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

function PlatformColumn({
  entry,
  isCheapest,
  priceDiffPct,
}: {
  entry: PlatformPrice;
  isCheapest: boolean;
  priceDiffPct: number;
}) {
  const badge = PLATFORM_LABELS[entry.platform] ?? {
    label: entry.platform,
    color: "bg-muted text-foreground border border-border",
  };

  return (
    <div
      className={`flex-1 rounded-xl p-4 space-y-3 border ${
        isCheapest
          ? "border-success/40 bg-success/5"
          : "border-border bg-muted/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}
        >
          {badge.label}
        </span>
        {entry.is_source && (
          <span className="text-xs text-muted-foreground">Mevcut</span>
        )}
        {isCheapest && !entry.is_source && (
          <span className="text-xs bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full">
            En ucuz
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {entry.name}
      </p>

      <div>
        <p className="text-xl font-bold text-foreground">
          {fmt.format(entry.current_price)}
        </p>
        {entry.original_price && entry.original_price > entry.current_price && (
          <p className="text-xs text-muted-foreground line-through">
            {fmt.format(entry.original_price)}
          </p>
        )}
        {isCheapest && !entry.is_source && priceDiffPct > 0 && (
          <p className="text-xs text-success font-medium mt-0.5">
            %{priceDiffPct.toFixed(1)} daha ucuz
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            entry.in_stock ? "bg-success" : "bg-muted-foreground/30"
          }`}
        />
        <span className={entry.in_stock ? "text-muted-foreground" : "text-muted-foreground/50"}>
          {entry.in_stock ? "Stokta var" : "Stokta yok"}
        </span>
      </div>

      {entry.avg_rating != null && (
        <p className="text-xs text-muted-foreground">
          ★{" "}
          <span className="text-foreground font-medium">{entry.avg_rating}</span>
        </p>
      )}

      {!entry.is_source && (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs bg-muted hover:bg-muted/80 transition-colors text-foreground rounded-lg py-1.5 px-3"
        >
          Satın Al →
        </a>
      )}
    </div>
  );
}

export function CompareCard({ productId }: CompareCardProps) {
  const { data, isLoading, isError } = useCompare(productId);

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            Platform Karşılaştırma
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trendyol · Hepsiburada
          </p>
        </div>
        {data && (
          <span className="text-xs text-muted-foreground">
            {new Date(data.compared_at).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="h-40 flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Rakip fiyatlar aranıyor…</p>
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Fiyat karşılaştırması şu an kullanılamıyor.
        </p>
      )}

      {data && (
        <>
          <div className="flex gap-3">
            {data.results.map((entry) => (
              <PlatformColumn
                key={entry.platform}
                entry={entry}
                isCheapest={entry.platform === data.cheapest_platform}
                priceDiffPct={data.price_diff_pct}
              />
            ))}
            {data.results.length === 1 && (
              <div className="flex-1 rounded-xl p-4 border border-border/50 bg-muted/10 flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center">
                  Rakip platform bulunamadı
                </p>
              </div>
            )}
          </div>

          {data.results.length === 2 && data.price_diff > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              Fiyat farkı:{" "}
              <span className="text-foreground font-medium">
                {fmt.format(data.price_diff)}
              </span>
            </p>
          )}
        </>
      )}
    </Card>
  );
}
