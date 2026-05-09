"use client";

import Link from "next/link";
import { useState } from "react";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { UrlForm } from "@/components/url-form";
import type { ProductResponse } from "@/types/product";

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export default function ProductsPage() {
  const { data, isLoading } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const products = data?.products ?? [];
  const filtered = search
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.platform?.toLowerCase().includes(search.toLowerCase()) ||
          p.brand?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteProduct(id, {
      onSettled: () => setDeletingId(null),
    });
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-10 max-w-5xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Takip Edilen Ürünler</h1>
          <p className="text-slate-400 text-sm mt-1">
            Yeni ürün ekle veya mevcut ürünleri yönet.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Ürün Ekle
          </h2>
          <UrlForm />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 gap-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Ürünler
              {!isLoading && (
                <span className="ml-2 text-slate-500 font-normal normal-case">
                  ({filtered.length})
                </span>
              )}
            </h2>
            <input
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-800/60 border border-slate-700 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
              {search ? "Arama sonucu bulunamadı." : "Henüz ürün eklenmemiş. Yukarıdan bir URL yapıştır!"}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onDelete={() => handleDelete(p.id)}
                  isDeleting={deletingId === p.id && isDeleting}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProductCard({
  product: p,
  onDelete,
  isDeleting,
}: {
  product: ProductResponse;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group">
      <Link href={`/products/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name ?? ""}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-500 text-xs">
            📦
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white truncate font-medium">{p.name ?? p.url}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400 capitalize">{p.platform}</span>
            {p.brand && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{p.brand}</span>
              </>
            )}
            {p.category && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-500 truncate">{p.category}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">
            {p.latest_price ? fmt.format(p.latest_price.price) : "—"}
          </p>
          {p.latest_price?.discount_pct ? (
            <p className="text-xs text-emerald-400">
              %{p.latest_price.discount_pct.toFixed(0)} indirim
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              {p.latest_price?.in_stock ? "Stokta var" : "Stok yok"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/products/${p.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Detay"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            title="Sil"
          >
            {isDeleting ? (
              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin block" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
