const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  health: () => fetchAPI<{ status: string; service: string }>("/api/health"),
  prices: {
    list: () => fetchAPI<{ prices: unknown[] }>("/api/prices/"),
    track: (url: string, targetPrice?: number) =>
      fetchAPI("/api/prices/track", {
        method: "POST",
        body: JSON.stringify({ url, target_price: targetPrice }),
      }),
  },
};
