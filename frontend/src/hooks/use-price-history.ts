"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function usePriceHistory(productId: string, days = 30) {
  return useQuery({
    queryKey: queryKeys.prices.history(productId, days),
    queryFn: () => api.prices.getHistory(productId, days),
    staleTime: 60_000,
    enabled: !!productId,
  });
}

export function usePriceStats(productId: string, days = 30) {
  return useQuery({
    queryKey: queryKeys.prices.stats(productId, days),
    queryFn: () => api.prices.getStats(productId, days),
    staleTime: 60_000,
    enabled: !!productId,
  });
}
