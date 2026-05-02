"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function TrackedProducts() {
  const { data, isLoading } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  if (isLoading) {
    return (
      <div className="mt-16 space-y-3">
        <div className="h-5 bg-slate-700/40 rounded w-40 animate-pulse" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-800/40 border border-slate-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data || data.total === 0) return null;

  function handleDelete(id: string, name: string) {
    deleteProduct(id, {
      onSuccess: () => toast.success(`"${name}" takip listesinden çıkarıldı`),
      onError: (err: Error) => toast.error(err.message),
    });
  }

  return (
    <div className="mt-16 text-left max-w-xl mx-auto">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Takip Edilen Ürünler ({data.total})
      </h2>
      <ul className="space-y-3">
        {data.products.map((product) => (
          <li
            key={product.id}
            className="flex items-center gap-4 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 hover:border-slate-500 transition-colors group"
          >
            {product.image_url && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <Link
              href={`/products/${product.id}`}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                {product.name}
              </p>
              <p className="text-lg font-bold text-blue-400 leading-tight">
                {formatPrice(product.latest_price.price)}
              </p>
              {product.latest_price.discount_pct && (
                <span className="text-xs text-green-400">
                  %{Math.round(product.latest_price.discount_pct)} indirim
                </span>
              )}
            </Link>
            <button
              onClick={() => handleDelete(product.id, product.name)}
              disabled={isDeleting}
              aria-label="Takibi bırak"
              className="text-slate-600 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
