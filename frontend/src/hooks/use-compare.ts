"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useCompare(productId: string) {
  return useQuery({
    queryKey: queryKeys.prices.comparison(productId),
    queryFn: () => api.prices.getComparison(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
