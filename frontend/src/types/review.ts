export interface ReviewSummaryResponse {
  pros: string[];
  cons: string[];
  satisfaction_score: number;
  summary: string;
  generated_at: string;
  review_count: number;
  tokens_used: number;
}

export interface SentimentTrendPoint {
  date: string;
  score: number;
  total: number;
}

export interface SentimentKeyword {
  word: string;
  count: number;
}

export interface SentimentResponse {
  score: number;
  total: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  trend: SentimentTrendPoint[];
  keywords: SentimentKeyword[];
}
