import asyncio
import json
import logging
import uuid

from app.agents.state import AgentState

logger = logging.getLogger(__name__)


async def price_analyst_node(state: AgentState) -> dict:
    from app.core.database import AsyncSessionLocal
    from app.repositories.product_repository import ProductRepository
    from app.services.forecast_service import ForecastService

    product_id = uuid.UUID(state["product_id"])
    errors = list(state["errors"])

    try:
        async with AsyncSessionLocal() as session:
            repo = ProductRepository(session)
            history = await repo.get_price_history(product_id, days=90)

        if not history:
            errors.append("Fiyat verisi bulunamadı")
            return {"errors": errors, "low_confidence": True, "data_points": 0}

        service = ForecastService()
        result = await asyncio.to_thread(
            service.forecast,
            product_id=state["product_id"],
            history=history,
            forecast_days=30,
        )
        return {
            "current_price": result.current_price,
            "predicted_price": result.predicted_final_price,
            "price_recommendation": result.recommendation,
            "low_confidence": result.low_confidence,
            "data_points": result.data_points,
            "errors": errors,
        }
    except Exception as exc:
        logger.error("price_analyst_node error: %s", exc)
        errors.append(f"Fiyat analizi hatası: {exc}")
        return {"errors": errors, "low_confidence": True, "data_points": 0}


async def review_rag_node(state: AgentState) -> dict:
    from app.core.redis import get_redis
    from app.services.embedding_service import query_similar_chunks
    from app.services.sentiment_service import (
        SentimentNotReadyError,
        get_or_compute_sentiment,
    )

    product_id = uuid.UUID(state["product_id"])
    errors = list(state["errors"])
    result: dict = {}

    try:
        chunks = await query_similar_chunks(
            "Bu ürünün genel kalitesi, artıları ve eksileri neler?",
            product_id,
            top_k=5,
        )
        result["review_chunks"] = chunks or []
    except Exception as exc:
        logger.warning("review_rag_node pinecone error: %s", exc)
        errors.append(f"Yorum verisi alınamadı: {exc}")
        result["review_chunks"] = []

    try:
        redis = await get_redis()
        sentiment = await get_or_compute_sentiment(product_id, redis)
        result["sentiment_score"] = sentiment.get("score")
        result["positive_pct"] = sentiment.get("positive_pct")
        result["negative_pct"] = sentiment.get("negative_pct")
    except SentimentNotReadyError:
        errors.append("Sentiment analizi henüz hazır değil")
    except Exception as exc:
        logger.warning("review_rag_node sentiment error: %s", exc)
        errors.append(f"Sentiment hatası: {exc}")

    result["errors"] = errors
    return result


async def decision_node(state: AgentState) -> dict:
    from openai import AsyncOpenAI

    from app.core.config import settings

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    price_ctx = "Fiyat verisi mevcut değil."
    if state.get("current_price") is not None:
        trend = ""
        if state.get("predicted_price") is not None:
            diff = state["predicted_price"] - state["current_price"]  # type: ignore[operator]
            trend = f" ({'+' if diff >= 0 else ''}{diff:.0f} TL değişim bekleniyor)"
        price_ctx = (
            f"Mevcut fiyat: {state['current_price']} TL\n"
            f"30 gün sonra tahmini: {state['predicted_price']} TL{trend}\n"
            f"Öneri: {state['price_recommendation']}\n"
            f"Güven: {'Düşük' if state.get('low_confidence') else 'Normal'} "
            f"({state.get('data_points', 0)} veri noktası)"
        )

    review_ctx = "Yorum verisi mevcut değil."
    if state.get("sentiment_score") is not None:
        review_ctx = (
            f"Sentiment skoru: {state['sentiment_score']}/100\n"
            f"Pozitif: {state.get('positive_pct', 0):.0f}%  "
            f"Negatif: {state.get('negative_pct', 0):.0f}%"
        )

    chunk_ctx = ""
    chunks = state.get("review_chunks") or []
    if chunks:
        lines = [f"- {c['text'][:160]}" for c in chunks[:3]]
        chunk_ctx = "\nİlgili yorum alıntıları:\n" + "\n".join(lines)

    prompt = (
        "Sen bir ürün satın alma danışmanısın. Aşağıdaki verilere dayanarak karar ver.\n\n"
        f"## Fiyat Analizi\n{price_ctx}\n\n"
        f"## Yorum Analizi\n{review_ctx}{chunk_ctx}\n\n"
        "Aşağıdaki JSON formatında yanıt ver:\n"
        '{"decision": "BUY" | "WAIT" | "LOOK_FOR_ALTERNATIVE", '
        '"reasoning": "Türkçe, 2-3 cümle açıklama", '
        '"confidence": <0-100 arası sayı>}\n\n'
        "Sadece JSON döndür."
    )

    errors = list(state.get("errors") or [])

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=300,
        )
        tokens = response.usage.total_tokens if response.usage else 0
        parsed = json.loads(response.choices[0].message.content or "{}")

        decision = parsed.get("decision", "WAIT")
        if decision not in ("BUY", "WAIT", "LOOK_FOR_ALTERNATIVE"):
            decision = "WAIT"

        gpt_confidence = max(0, min(100, int(parsed.get("confidence", 50))))
        reasoning: str = parsed.get("reasoning", "Yeterli veri toplanamadı.")

        # Rule-based confidence signals
        signals: list[int] = []
        signals.append(70 if state.get("data_points", 0) >= 7 else 30)
        if state.get("sentiment_score") is not None:
            signals.append(int(state["sentiment_score"]))  # type: ignore[arg-type]
        signals.append(80 if chunks else 40)

        rule_confidence = int(sum(signals) / len(signals))
        final_confidence = round(0.6 * gpt_confidence + 0.4 * rule_confidence)

        return {
            "decision": decision,
            "gpt_confidence": gpt_confidence,
            "rule_confidence": rule_confidence,
            "final_confidence": final_confidence,
            "reasoning": reasoning,
            "tokens_used": state.get("tokens_used", 0) + tokens,
            "errors": errors,
        }

    except Exception as exc:
        logger.error("decision_node error: %s", exc)
        errors.append(f"Karar üretme hatası: {exc}")
        return {
            "decision": "WAIT",
            "gpt_confidence": 0,
            "rule_confidence": 0,
            "final_confidence": 0,
            "reasoning": "Karar üretilirken bir hata oluştu.",
            "errors": errors,
        }
