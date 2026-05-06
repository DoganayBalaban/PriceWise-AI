"use client";

import { useCompare } from "@/hooks/use-compare";
import type { PlatformPrice } from "@/types/comparison";

interface CompareCardProps {
  productId: string;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  trendyol: {
    label: "Trendyol",
    color: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  },
  hepsiburada: {
    label: "Hepsiburada",
    color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
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
    color: "bg-slate-700 text-slate-300 border border-slate-600",
  };

  return (
    <div
      className={`flex-1 rounded-xl p-4 space-y-3 border ${
        isCheapest
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-slate-700 bg-slate-800/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}
        >
          {badge.label}
        </span>
        {entry.is_source && (
          <span className="text-xs text-slate-500">Mevcut</span>
        )}
        {isCheapest && !entry.is_source && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            En ucuz
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {entry.name}
      </p>

      <div>
        <p className="text-xl font-bold text-white">
          {fmt.format(entry.current_price)}
        </p>
        {entry.original_price && entry.original_price > entry.current_price && (
          <p className="text-xs text-slate-500 line-through">
            {fmt.format(entry.original_price)}
          </p>
        )}
        {isCheapest && !entry.is_source && priceDiffPct > 0 && (
          <p className="text-xs text-emerald-400 font-medium mt-0.5">
            %{priceDiffPct.toFixed(1)} daha ucuz
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            entry.in_stock ? "bg-emerald-400" : "bg-slate-600"
          }`}
        />
        <span className={entry.in_stock ? "text-slate-400" : "text-slate-600"}>
          {entry.in_stock ? "Stokta var" : "Stokta yok"}
        </span>
      </div>

      {entry.avg_rating != null && (
        <p className="text-xs text-slate-400">
          ★{" "}
          <span className="text-white font-medium">{entry.avg_rating}</span>
        </p>
      )}

      {!entry.is_source && (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 rounded-lg py-1.5 px-3"
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
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Platform Karşılaştırma
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trendyol · Hepsiburada
          </p>
        </div>
        {data && (
          <span className="text-xs text-slate-500">
            {new Date(data.compared_at).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="h-40 flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Rakip fiyatlar aranıyor…</p>
        </div>
      )}

      {isError && (
        <p className="text-sm text-slate-500 text-center py-6">
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
              <div className="flex-1 rounded-xl p-4 border border-slate-700/50 bg-slate-800/20 flex items-center justify-center">
                <p className="text-xs text-slate-600 text-center">
                  Rakip platform bulunamadı
                </p>
              </div>
            )}
          </div>

          {data.results.length === 2 && data.price_diff > 0 && (
            <p className="text-xs text-slate-500 text-right">
              Fiyat farkı:{" "}
              <span className="text-white font-medium">
                {fmt.format(data.price_diff)}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
