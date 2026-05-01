"use client";

import Image from "next/image";
import type { ProductResponse } from "@/types/product";

const PLATFORM_STYLES: Record<string, string> = {
  trendyol: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  hepsiburada: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const { latest_price: price } = product;
  const platformStyle =
    PLATFORM_STYLES[product.platform] ??
    "bg-slate-500/20 text-slate-300 border-slate-500/30";

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden max-w-2xl mx-auto">
      {product.image_url && (
        <div className="relative w-full h-64 bg-slate-900">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-white leading-snug">
            {product.name}
          </h1>
          <span
            className={`shrink-0 text-xs font-medium border rounded-full px-3 py-1 capitalize ${platformStyle}`}
          >
            {product.platform}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-3xl font-bold text-white">
            ₺{price.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </span>

          {price.original_price && price.original_price > price.price && (
            <span className="text-slate-400 line-through text-lg">
              ₺
              {price.original_price.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}
            </span>
          )}

          {price.discount_pct && price.discount_pct > 0 && (
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-semibold rounded-full px-3 py-1">
              %{price.discount_pct.toFixed(1)} indirim
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium rounded-full px-3 py-1 border ${
              price.in_stock
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {price.in_stock ? "Stokta var" : "Stokta yok"}
          </span>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ürüne git →
          </a>
        </div>
      </div>
    </div>
  );
}
