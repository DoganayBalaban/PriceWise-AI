"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ProductResponse } from "@/types/product";

export function useSubmitProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => api.products.submit(url),
    onSuccess: (data: ProductResponse) => {
      queryClient.setQueryData(queryKeys.products.byId(data.id), data);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.byId(id),
    queryFn: () => api.products.getById(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}
