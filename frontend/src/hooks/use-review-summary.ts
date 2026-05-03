"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useReviewSummary(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId),
    queryFn: () => api.reviews.getSummary(productId),
    enabled: !!productId,
    retry: false,
    staleTime: 1000 * 60 * 30,
  });
}
