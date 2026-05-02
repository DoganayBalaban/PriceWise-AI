import logging
from datetime import datetime, timedelta

import numpy as np
from sklearn.linear_model import LinearRegression

from app.core.config import settings
from app.models.price_history import PriceHistory
from app.schemas.prices import ForecastPoint, ForecastResponse

logger = logging.getLogger(__name__)

_MIN_DATA_POINTS = 7


def _log_to_mlflow(
    product_id: str,
    forecast_days: int,
    n_points: int,
    mae: float,
    model: LinearRegression,
) -> None:
    try:
        import mlflow
        import mlflow.sklearn

        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        with mlflow.start_run(run_name=f"forecast_{product_id}_{forecast_days}d"):
            mlflow.log_param("product_id", product_id)
            mlflow.log_param("forecast_days", forecast_days)
            mlflow.log_param("n_points", n_points)
            mlflow.log_metric("mae", mae)
            mlflow.sklearn.log_model(model, "linear_regression")
    except Exception:
        logger.warning("MLflow logging failed — skipping", exc_info=True)


class ForecastService:
    def forecast(
        self,
        product_id: str,
        history: list[PriceHistory],
        forecast_days: int,
    ) -> ForecastResponse:
        low_confidence = len(history) < _MIN_DATA_POINTS

        prices = np.array([float(h.price) for h in history])
        n = len(prices)

        X = np.arange(n).reshape(-1, 1).astype(float)
        model = LinearRegression()
        model.fit(X, prices)

        y_pred_train = model.predict(X)
        mae = float(np.mean(np.abs(prices - y_pred_train)))

        X_future = np.arange(n, n + forecast_days).reshape(-1, 1).astype(float)
        future_prices = model.predict(X_future)

        last_date = history[-1].scraped_at
        if last_date.tzinfo is not None:
            last_date = last_date.replace(tzinfo=None)

        forecast_points = [
            ForecastPoint(
                date=last_date + timedelta(days=i + 1),
                predicted_price=round(float(max(future_prices[i], 0.01)), 2),
            )
            for i in range(forecast_days)
        ]

        current_price = float(history[-1].price)
        predicted_final = round(float(max(future_prices[-1], 0.01)), 2)

        if predicted_final < current_price * 0.95:
            recommendation = "AL"
        elif predicted_final > current_price * 1.05:
            recommendation = "BEKLE"
        else:
            recommendation = "TAKIPTE KAL"

        _log_to_mlflow(product_id, forecast_days, n, mae, model)

        return ForecastResponse(
            product_id=product_id,
            forecast_days=forecast_days,
            forecast=forecast_points,
            current_price=current_price,
            predicted_final_price=predicted_final,
            mae=round(mae, 2),
            low_confidence=low_confidence,
            recommendation=recommendation,
            data_points=n,
        )
