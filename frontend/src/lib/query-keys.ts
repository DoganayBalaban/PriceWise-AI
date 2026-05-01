export const queryKeys = {
  health: ["health"] as const,
  prices: {
    all: ["prices"] as const,
    track: (url: string) => ["prices", "track", url] as const,
  },
  products: {
    all: ["products"] as const,
    byId: (id: string) => ["products", id] as const,
  },
};
