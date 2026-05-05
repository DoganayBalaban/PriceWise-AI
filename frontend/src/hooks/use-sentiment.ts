"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSentiment(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.sentiment(productId),
    queryFn: () => api.reviews.getSentiment(productId),
    enabled: !!productId,
    retry: false,
    staleTime: 1000 * 60 * 30,
  });
}
