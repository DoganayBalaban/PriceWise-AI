export interface PlatformPrice {
  platform: string;
  url: string;
  name: string;
  current_price: number;
  original_price: number | null;
  discount_pct: number | null;
  in_stock: boolean;
  image_url: string | null;
  avg_rating: number | null;
  is_source: boolean;
}

export interface ComparisonResult {
  product_id: string;
  compared_at: string;
  results: PlatformPrice[];
  cheapest_platform: string;
  price_diff: number;
  price_diff_pct: number;
}
