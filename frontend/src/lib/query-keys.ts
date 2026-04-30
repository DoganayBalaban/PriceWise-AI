export const queryKeys = {
  health: ["health"] as const,
  prices: {
    all: ["prices"] as const,
    track: (url: string) => ["prices", "track", url] as const,
  },
};
