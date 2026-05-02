"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ProductResponse } from "@/types/product";

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => api.products.list(),
    staleTime: 60_000,
  });
}

export function useSubmitProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => api.products.submit(url),
    onSuccess: (data: ProductResponse) => {
      queryClient.setQueryData(queryKeys.products.byId(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useRefreshProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.products.refresh(id),
    onSuccess: (data: ProductResponse) => {
      queryClient.setQueryData(queryKeys.products.byId(data.id), data);
    },
  });
}
