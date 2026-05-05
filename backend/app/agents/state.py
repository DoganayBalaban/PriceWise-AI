from typing import TypedDict


class AgentState(TypedDict):
    product_id: str
    # Price Analyst
    current_price: float | None
    predicted_price: float | None
    price_recommendation: str | None
    low_confidence: bool
    data_points: int
    # Review RAG
    review_chunks: list[dict]
    sentiment_score: int | None
    positive_pct: float | None
    negative_pct: float | None
    # Decision
    decision: str | None  # BUY | WAIT | LOOK_FOR_ALTERNATIVE
    gpt_confidence: int | None
    rule_confidence: int | None
    final_confidence: int | None
    reasoning: str | None
    # Meta
    errors: list[str]
    tokens_used: int
