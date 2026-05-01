"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSubmitProduct } from "@/hooks/use-products";

export function UrlForm() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { mutate, isPending } = useSubmitProduct();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    mutate(url.trim(), {
      onSuccess: (data) => {
        router.push(`/products/${data.id}`);
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl mx-auto">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste Trendyol or Hepsiburada URL here..."
        required
        disabled={isPending}
        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Tracking...
          </>
        ) : (
          "Track Price"
        )}
      </button>
    </form>
  );
}
