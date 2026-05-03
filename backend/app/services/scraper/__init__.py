from app.core.config import settings
from app.services.scraper.base import ScrapedProduct, ScrapedReview
from app.services.scraper.hepsiburada import HepsiburadaScraper
from app.services.scraper.trendyol import TrendyolScraper


class ScraperService:
    async def scrape(self, url: str, platform: str) -> ScrapedProduct:
        return await self._get_scraper(platform).scrape(url)

    async def scrape_reviews(
        self, url: str, platform: str, max_reviews: int = 100
    ) -> list[ScrapedReview]:
        return await self._get_scraper(platform).scrape_reviews(url, max_reviews)

    def _get_scraper(self, platform: str) -> TrendyolScraper | HepsiburadaScraper:
        if platform == "trendyol":
            return TrendyolScraper(headless=settings.PLAYWRIGHT_HEADLESS)
        elif platform == "hepsiburada":
            return HepsiburadaScraper(headless=settings.PLAYWRIGHT_HEADLESS)
        else:
            raise ValueError(f"No scraper available for platform: {platform}")
