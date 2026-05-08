from app.core.config import settings
from app.services.scraper.base import ScrapedProduct, ScrapedReview
from app.services.scraper.hepsiburada import HepsiburadaScraper
from app.services.scraper.n11 import N11Scraper
from app.services.scraper.trendyol import TrendyolScraper


class ScraperService:
    async def scrape(self, url: str, platform: str) -> ScrapedProduct:
        return await self._get_scraper(platform).scrape(url)

    async def scrape_reviews(
        self, url: str, platform: str, max_reviews: int = 100
    ) -> list[ScrapedReview]:
        return await self._get_scraper(platform).scrape_reviews(url, max_reviews)

    async def search_first_result(self, query: str, platform: str) -> str | None:
        return await self._get_scraper(platform).search_first_result(query)

    def _get_scraper(
        self, platform: str
    ) -> TrendyolScraper | HepsiburadaScraper | N11Scraper:
        if platform == "trendyol":
            return TrendyolScraper(headless=settings.PLAYWRIGHT_HEADLESS)
        elif platform == "hepsiburada":
            return HepsiburadaScraper(headless=settings.PLAYWRIGHT_HEADLESS)
        elif platform == "n11":
            return N11Scraper(headless=settings.PLAYWRIGHT_HEADLESS)
        else:
            raise ValueError(f"No scraper available for platform: {platform}")
