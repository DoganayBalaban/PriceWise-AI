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
    return Promise.reject(new Error(message));
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
  },
  alerts: {
    list: () =>
      apiClient
        .get<AlertResponse[]>("/api/alerts/")
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
