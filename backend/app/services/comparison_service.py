import asyncio
import logging
import uuid
from datetime import datetime, timezone

from app.models.price_history import PriceHistory
from app.models.product import Product
from app.repositories.review_repository import ReviewRepository
from app.schemas.comparison import ComparisonResult, PlatformPrice
from app.services.scraper import ScraperService

logger = logging.getLogger(__name__)

_COMPETITOR: dict[str, str] = {
    "trendyol": "hepsiburada",
    "hepsiburada": "trendyol",
}


class ComparisonService:
    def __init__(
        self,
        scraper_service: ScraperService,
        review_repo: ReviewRepository,
    ) -> None:
        self.scraper = scraper_service
        self.review_repo = review_repo

    async def compare(
        self,
        product: Product,
        latest_price: PriceHistory,
    ) -> ComparisonResult:
        competitor_platform = _COMPETITOR.get(product.platform)

        async def _none() -> None:
            return None

        source_task = self._fetch_source_price(product, latest_price)
        competitor_task = (
            self._fetch_competitor_price(product, competitor_platform)
            if competitor_platform
            else _none()
        )

        source, competitor = await asyncio.gather(
            source_task, competitor_task, return_exceptions=True
        )

        if isinstance(source, BaseException):
            logger.error("Source price fetch failed: %s", source)
            source = self._fallback_source(product, latest_price)

        if isinstance(competitor, BaseException):
            logger.warning("Competitor price fetch failed: %s", competitor)
            competitor = None

        return self._build_result(product.id, source, competitor)

    async def _fetch_source_price(
        self, product: Product, latest_price: PriceHistory
    ) -> PlatformPrice:
        avg_rating = await self.review_repo.get_avg_rating(product.id)
        return PlatformPrice(
            platform=product.platform,
            url=product.url,
            name=product.name,
            current_price=float(latest_price.price),
            original_price=float(latest_price.original_price)
            if latest_price.original_price
            else None,
            discount_pct=float(latest_price.discount_pct)
            if latest_price.discount_pct
            else None,
            in_stock=latest_price.in_stock,
            image_url=product.image_url,
            avg_rating=avg_rating,
            is_source=True,
        )

    async def _fetch_competitor_price(
        self, product: Product, competitor_platform: str
    ) -> PlatformPrice | None:
        try:
            competitor_url = await self.scraper.search_first_result(
                product.name, competitor_platform
            )
            if not competitor_url:
                logger.info(
                    "No search result for %r on %s", product.name, competitor_platform
                )
                return None

            scraped = await self.scraper.scrape(competitor_url, competitor_platform)
            return PlatformPrice(
                platform=competitor_platform,
                url=competitor_url,
                name=scraped.name,
                current_price=scraped.current_price,
                original_price=scraped.original_price,
                discount_pct=scraped.discount_pct,
                in_stock=scraped.in_stock,
                image_url=scraped.image_url,
                avg_rating=None,
                is_source=False,
            )
        except Exception as exc:
            logger.warning(
                "Competitor scrape failed for %s on %s: %s",
                product.name,
                competitor_platform,
                exc,
            )
            return None

    def _fallback_source(
        self, product: Product, latest_price: PriceHistory
    ) -> PlatformPrice:
        return PlatformPrice(
            platform=product.platform,
            url=product.url,
            name=product.name,
            current_price=float(latest_price.price),
            original_price=None,
            discount_pct=None,
            in_stock=latest_price.in_stock,
            image_url=product.image_url,
            avg_rating=None,
            is_source=True,
        )

    def _build_result(
        self,
        product_id: uuid.UUID,
        source: PlatformPrice,
        competitor: PlatformPrice | None,
    ) -> ComparisonResult:
        results = [source]
        if competitor is not None:
            results.append(competitor)

        if competitor is not None:
            if competitor.current_price < source.current_price:
                cheapest = competitor.platform
                diff = round(source.current_price - competitor.current_price, 2)
                diff_pct = round(diff / source.current_price * 100, 1)
            else:
                cheapest = source.platform
                diff = round(competitor.current_price - source.current_price, 2)
                diff_pct = round(diff / competitor.current_price * 100, 1) if competitor.current_price > 0 else 0.0
        else:
            cheapest = source.platform
            diff = 0.0
            diff_pct = 0.0

        return ComparisonResult(
            product_id=product_id,
            compared_at=datetime.now(tz=timezone.utc),
            results=results,
            cheapest_platform=cheapest,
            price_diff=diff,
            price_diff_pct=diff_pct,
        )
