"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { AlertCreateRequest, AlertUpdateRequest } from "@/types/alert";

export function useAlerts(active?: boolean) {
  return useQuery({
    queryKey: [...queryKeys.alerts.all, { active }],
    queryFn: () => api.alerts.list(active),
    staleTime: 60_000,
  });
}

export function useProductAlert(productId: string) {
  const { data: alerts } = useAlerts(true);
  return alerts?.find((a) => a.product_id === productId) ?? null;
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AlertCreateRequest) => api.alerts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlertUpdateRequest }) =>
      api.alerts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.alerts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useTestAlert() {
  return useMutation({
    mutationFn: (id: string) => api.alerts.test(id),
  });
}
