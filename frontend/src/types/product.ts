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
