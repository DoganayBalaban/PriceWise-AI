"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSessions(page = 1) {
  return useQuery({
    queryKey: [...queryKeys.agent.sessions, page],
    queryFn: () => api.agent.getSessions(page),
    staleTime: 30_000,
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.agent.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions });
    },
  });
}
