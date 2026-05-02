"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useForecast(productId: string, days = 30) {
  return useQuery({
    queryKey: queryKeys.prices.forecast(productId, days),
    queryFn: () => api.prices.getForecast(productId, days),
    staleTime: 1000 * 60 * 30,
  });
}
