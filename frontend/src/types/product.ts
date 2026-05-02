export interface PriceData {
  price: number;
  original_price: number | null;
  discount_pct: number | null;
  in_stock: boolean;
  scraped_at: string;
}

export interface ProductResponse {
  id: string;
  url: string;
  platform: "trendyol" | "hepsiburada" | string;
  name: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
  latest_price: PriceData;
}

export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
}

export interface PriceHistoryEntry {
  price: number;
  original_price: number | null;
  discount_pct: number | null;
  in_stock: boolean;
  scraped_at: string;
}

export interface PriceStatsResponse {
  product_id: string;
  days: number;
  min_price: number | null;
  max_price: number | null;
  avg_price: number | null;
  stddev_price: number | null;
  data_points: number;
}

export interface ForecastPoint {
  date: string;
  predicted_price: number;
}

export interface ForecastResponse {
  product_id: string;
  forecast_days: number;
  forecast: ForecastPoint[];
  current_price: number;
  predicted_final_price: number;
  mae: number;
  low_confidence: boolean;
  recommendation: "AL" | "BEKLE" | "TAKIPTE KAL";
  data_points: number;
}
