from app.core.config import settings
from app.services.scraper.base import ScrapedProduct
from app.services.scraper.hepsiburada import HepsiburadaScraper
from app.services.scraper.trendyol import TrendyolScraper


class ScraperService:
    async def scrape(self, url: str, platform: str) -> ScrapedProduct:
        if platform == "trendyol":
            scraper = TrendyolScraper(headless=settings.PLAYWRIGHT_HEADLESS)
        elif platform == "hepsiburada":
            scraper = HepsiburadaScraper(headless=settings.PLAYWRIGHT_HEADLESS)
        else:
            raise ValueError(f"No scraper available for platform: {platform}")
        return await scraper.scrape(url)
