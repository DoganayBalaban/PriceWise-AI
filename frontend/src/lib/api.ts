import axios from "axios";
import type {
  AlertCreateRequest,
  AlertResponse,
  AlertUpdateRequest,
} from "@/types/alert";
import type {
  ForecastResponse,
  PriceHistoryEntry,
  PriceStatsResponse,
  ProductListResponse,
  ProductResponse,
} from "@/types/product";
import type { AgentSession } from "@/types/agent";
import type { ComparisonResult } from "@/types/comparison";
import type { ReviewSummaryResponse, SentimentResponse } from "@/types/review";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from Better Auth's /token endpoint before each request
apiClient.interceptors.request.use(async (config) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/token`,
      { credentials: "include" }
    );
    if (res.ok) {
      const data = (await res.json()) as { token?: string };
      if (data.token) {
        config.headers.Authorization = `Bearer ${data.token}`;
      }
    }
  } catch {
    // No session — request proceeds without auth header
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ?? err.message ?? "Unknown error";
    const error = new Error(message) as Error & { status?: number };
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

export const api = {
  health: () =>
    apiClient
      .get<{ status: string; service: string }>("/api/health")
      .then((r) => r.data),
  products: {
    list: () =>
      apiClient
        .get<ProductListResponse>("/api/products/")
        .then((r) => r.data),
    submit: (url: string) =>
      apiClient
        .post<ProductResponse>("/api/products/", { url })
        .then((r) => r.data),
    getById: (id: string) =>
      apiClient
        .get<ProductResponse>(`/api/products/${id}`)
        .then((r) => r.data),
    delete: (id: string) =>
      apiClient.delete(`/api/products/${id}`).then((r) => r.data),
    refresh: (id: string) =>
      apiClient
        .post<ProductResponse>(`/api/products/${id}/refresh`)
        .then((r) => r.data),
  },
  prices: {
    getHistory: (productId: string, days = 30) =>
      apiClient
        .get<PriceHistoryEntry[]>(`/api/prices/${productId}/history`, {
          params: { days },
        })
        .then((r) => r.data),
    getStats: (productId: string, days = 30) =>
      apiClient
        .get<PriceStatsResponse>(`/api/prices/${productId}/stats`, {
          params: { days },
        })
        .then((r) => r.data),
    getForecast: (productId: string, days = 30) =>
      apiClient
        .get<ForecastResponse>(`/api/prices/${productId}/forecast`, {
          params: { days },
        })
        .then((r) => r.data),
    getComparison: (productId: string) =>
      apiClient
        .get<ComparisonResult>(`/api/prices/${productId}/compare`)
        .then((r) => r.data),
  },
  reviews: {
    getStatus: (productId: string) =>
      apiClient
        .get<{ total: number; embedded: number; rag_ready: boolean }>(`/api/reviews/${productId}`)
        .then((r) => r.data),
    getSummary: (productId: string) =>
      apiClient
        .get<ReviewSummaryResponse>(`/api/reviews/${productId}/summary`)
        .then((r) => r.data),
    getSentiment: (productId: string) =>
      apiClient
        .get<SentimentResponse>(`/api/reviews/${productId}/sentiment`)
        .then((r) => r.data),
  },
  agent: {
    getSessions: (page = 1) =>
      apiClient
        .get<AgentSession[]>("/api/agent/sessions", { params: { page } })
        .then((r) => r.data),
    getSession: (id: string) =>
      apiClient
        .get<AgentSession>(`/api/agent/sessions/${id}`)
        .then((r) => r.data),
    deleteSession: (id: string) =>
      apiClient.delete(`/api/agent/sessions/${id}`).then((r) => r.data),
  },
  payments: {
    getCheckoutUrl: (plan: "pro" | "business") =>
      apiClient
        .get<{ url: string }>(`/api/payments/checkout/${plan}`)
        .then((r) => r.data),
  },
  alerts: {
    list: (active?: boolean) =>
      apiClient
        .get<AlertResponse[]>("/api/alerts/", { params: active !== undefined ? { active } : {} })
        .then((r) => r.data),
    create: (data: AlertCreateRequest) =>
      apiClient.post<AlertResponse>("/api/alerts/", data).then((r) => r.data),
    update: (id: string, data: AlertUpdateRequest) =>
      apiClient.put<AlertResponse>(`/api/alerts/${id}`, data).then((r) => r.data),
    delete: (id: string) =>
      apiClient.delete(`/api/alerts/${id}`).then((r) => r.data),
    test: (id: string) =>
      apiClient.post<{ sent: boolean; to: string }>(`/api/alerts/test/${id}`).then((r) => r.data),
  },
};
