"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function usePrices() {
  return useQuery({
    queryKey: queryKeys.prices.all,
    queryFn: api.prices.list,
    staleTime: 60_000,
  });
}

export function useTrackPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, targetPrice }: { url: string; targetPrice?: number }) =>
      api.prices.track(url, targetPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prices.all });
    },
  });
}
