export interface ReviewSummaryResponse {
  pros: string[];
  cons: string[];
  satisfaction_score: number;
  summary: string;
  generated_at: string;
  review_count: number;
  tokens_used: number;
}
