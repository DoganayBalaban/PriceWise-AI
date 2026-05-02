export interface AlertResponse {
  id: string;
  product_id: string;
  email: string;
  target_price: number;
  active: boolean;
  created_at: string;
}

export interface AlertCreateRequest {
  product_id: string;
  email: string;
  target_price: number;
}

export interface AlertUpdateRequest {
  target_price?: number;
  active?: boolean;
}
