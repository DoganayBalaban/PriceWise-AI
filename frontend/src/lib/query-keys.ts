export const queryKeys = {
  health: ["health"] as const,
  products: {
    all: ["products"] as const,
    byId: (id: string) => ["products", id] as const,
  },
  prices: {
    history: (productId: string, days: number) =>
      ["prices", productId, "history", days] as const,
    stats: (productId: string, days: number) =>
      ["prices", productId, "stats", days] as const,
  },
};
