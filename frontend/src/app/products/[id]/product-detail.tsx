"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProduct, useDeleteProduct, useRefreshProduct } from "@/hooks/use-products";
import { AlertButton } from "@/components/alert-button";
import { ForecastCard } from "@/components/forecast-card";
import { PriceChart } from "@/components/price-chart";
import { ProductCard } from "@/components/product-card";
import { ReviewChat } from "@/components/review-chat";

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useProduct(id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: refreshProduct, isPending: isRefreshing } = useRefreshProduct();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="h-64 bg-slate-700/50" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-700/50 rounded w-3/4" />
            <div className="h-10 bg-slate-700/50 rounded w-1/3" />
            <div className="h-4 bg-slate-700/50 rounded w-1/4" />
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{(error as Error).message}</p>
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Ana sayfaya dön
        </Link>
      </div>
    );
  }

  if (!data) return null;

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
        router.push("/");
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Yeni ürün takip et
        </Link>
        <div className="flex gap-2">
          <AlertButton
            productId={id}
            currentPrice={data.latest_price.price}
          />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            )}
            Güncelle
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            Takibi Bırak
          </button>
        </div>
      </div>
      <ProductCard product={data} />
      <PriceChart productId={id} />
      <ForecastCard productId={id} />
      <ReviewChat productId={id} />
    </div>
  );
}
