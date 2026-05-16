export type AgentDecision = "BUY" | "WAIT" | "LOOK_FOR_ALTERNATIVE";

export interface AgentDecisionResult {
  decision: AgentDecision;
  final_confidence: number;
  reasoning: string;
  current_price: number | null;
  predicted_price: number | null;
  price_recommendation: string | null;
  sentiment_score: number | null;
  errors: string[];
}

export interface AgentSession {
  id: string;
  product_id: string;
  product_name: string | null;
  query: string;
  created_at: string;
  tokens_used: number | null;
  result: AgentDecisionResult;
}
