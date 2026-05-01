"use client";

import Link from "next/link";
import { useProduct } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const { data, isLoading, isError, error } = useProduct(id);

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

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Yeni ürün takip et
      </Link>
      <ProductCard product={data} />
    </div>
  );
}
