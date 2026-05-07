"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.auth.me(),
    staleTime: 60_000,
  });
}

export function usePortal() {
  return useMutation({
    mutationFn: () => api.payments.getPortalUrl(),
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}
