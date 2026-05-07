import logging
from datetime import timedelta

import numpy as np
from sklearn.linear_model import LinearRegression

from app.core.config import settings
from app.models.price_history import PriceHistory
from app.schemas.prices import ForecastPoint, ForecastResponse

logger = logging.getLogger(__name__)

# Suppress Prophet / CmdStan verbose output
logging.getLogger("prophet").setLevel(logging.WARNING)
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)

_MIN_DATA_POINTS = 7
_PROPHET_MIN_POINTS = 14


def _log_to_mlflow(
    product_id: str,
    forecast_days: int,
    n_points: int,
    mae: float,
    model_name: str,
) -> None:
    try:
        import mlflow

        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        with mlflow.start_run(run_name=f"forecast_{product_id}_{forecast_days}d"):
            mlflow.log_param("product_id", product_id)
            mlflow.log_param("forecast_days", forecast_days)
            mlflow.log_param("n_points", n_points)
            mlflow.log_param("model", model_name)
            mlflow.log_metric("mae", mae)
    except Exception:
        logger.warning("MLflow logging failed — skipping", exc_info=True)


def _linear_forecast(
    history: list[PriceHistory],
    forecast_days: int,
) -> tuple[np.ndarray, float]:
    prices = np.array([float(h.price) for h in history])
    n = len(prices)
    X = np.arange(n).reshape(-1, 1).astype(float)
    model = LinearRegression().fit(X, prices)
    mae = float(np.mean(np.abs(prices - model.predict(X))))
    X_future = np.arange(n, n + forecast_days).reshape(-1, 1).astype(float)
    return model.predict(X_future), mae


def _prophet_forecast(
    history: list[PriceHistory],
    forecast_days: int,
) -> tuple[np.ndarray, float]:
    import pandas as pd
    from prophet import Prophet

    df = pd.DataFrame(
        {
            "ds": [
                h.scraped_at.replace(tzinfo=None)
                if h.scraped_at.tzinfo is not None
                else h.scraped_at
                for h in history
            ],
            "y": [float(h.price) for h in history],
        }
    )

    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=False,
        changepoint_prior_scale=0.05,
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=forecast_days, freq="D")
    forecast_df = model.predict(future)

    in_sample_preds = forecast_df.iloc[: len(df)]["yhat"].to_numpy()
    mae = float(np.mean(np.abs(df["y"].to_numpy() - in_sample_preds)))

    future_preds = forecast_df.iloc[len(df) :]["yhat"].to_numpy()
    return future_preds, mae


class ForecastService:
    def forecast(
        self,
        product_id: str,
        history: list[PriceHistory],
        forecast_days: int,
    ) -> ForecastResponse:
        low_confidence = len(history) < _MIN_DATA_POINTS
        n = len(history)

        if n >= _PROPHET_MIN_POINTS:
            future_prices, mae = _prophet_forecast(history, forecast_days)
            model_name = "prophet"
        else:
            future_prices, mae = _linear_forecast(history, forecast_days)
            model_name = "linear_regression"

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

        _log_to_mlflow(product_id, forecast_days, n, mae, model_name)

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
