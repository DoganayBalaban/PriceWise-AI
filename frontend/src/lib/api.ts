import axios from "axios";
import type {
  PriceHistoryEntry,
  PriceStatsResponse,
  ProductListResponse,
  ProductResponse,
} from "@/types/product";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
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
  },
};
