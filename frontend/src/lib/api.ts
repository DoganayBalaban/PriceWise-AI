import axios from "axios";
import type { ProductResponse } from "@/types/product";

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
  prices: {
    list: () =>
      apiClient.get<{ prices: unknown[] }>("/api/prices/").then((r) => r.data),
    track: (url: string, targetPrice?: number) =>
      apiClient
        .post("/api/prices/track", { url, target_price: targetPrice })
        .then((r) => r.data),
  },
  products: {
    submit: (url: string) =>
      apiClient
        .post<ProductResponse>("/api/products/", { url })
        .then((r) => r.data),
    getById: (id: string) =>
      apiClient
        .get<ProductResponse>(`/api/products/${id}`)
        .then((r) => r.data),
  },
};
