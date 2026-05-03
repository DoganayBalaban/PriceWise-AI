import re
from datetime import date, datetime

from playwright.async_api import async_playwright

from app.services.scraper.base import BaseScraper, ScrapedReview, _USER_AGENT

_MONTH_MAP = {
    "Ocak": 1, "Şubat": 2, "Mart": 3, "Nisan": 4,
    "Mayıs": 5, "Haziran": 6, "Temmuz": 7, "Ağustos": 8,
    "Eylül": 9, "Ekim": 10, "Kasım": 11, "Aralık": 12,
}


class TrendyolScraper(BaseScraper):
    WAIT_SELECTOR = "h1.product-title, h1"
    NAME_SELECTORS = [
        "h1.product-title",
        "h1.product-title.variant-pdp",
        "h1",
    ]
    CURRENT_PRICE_SELECTORS = [
        ".price-view span.discounted",
        "span.discounted",
        ".price-view span.original",
        ".price.normal-price",
        ".price-wrapper .price",
    ]
    ORIGINAL_PRICE_SELECTORS = [
        ".price-view span.original",
        "span.original",
        ".price.line-through",
        ".original-price",
    ]
    IMAGE_SELECTORS = [
        "[class*='product-image'] img",
        "[class*='gallery'] img",
        "img[class*='product']",
    ]
    OUT_OF_STOCK_SELECTOR = ".soldout-message, .out-of-stock, [class*='soldout']"

    def _reviews_url(self, product_url: str) -> str:
        """Derive the /yorumlar page URL from the product URL."""
        base = product_url.split("?")[0].rstrip("/")
        if not base.endswith("/yorumlar"):
            base += "/yorumlar"
        return base

    def _parse_date(self, day: str, month: str, year: str) -> date | None:
        try:
            m = _MONTH_MAP.get(month.strip())
            if m:
                return date(int(year.strip()), m, int(day.strip()))
        except (ValueError, KeyError):
            pass
        return None

    async def scrape_reviews(self, url: str, max_reviews: int = 100) -> list[ScrapedReview]:
        reviews_url = self._reviews_url(url)
        reviews: list[ScrapedReview] = []

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=self.headless)
            try:
                ctx = await browser.new_context(
                    user_agent=_USER_AGENT,
                    viewport={"width": 1280, "height": 800},
                )
                page = await ctx.new_page()

                page_num = 1
                while len(reviews) < max_reviews and page_num <= 10:
                    paginated_url = f"{reviews_url}?sayfa={page_num}" if page_num > 1 else reviews_url
                    await page.goto(paginated_url, wait_until="domcontentloaded", timeout=25_000)
                    await page.wait_for_timeout(3000)

                    # Scroll to trigger lazy-loaded reviews
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                    await page.wait_for_timeout(1500)

                    items = page.locator(".review-list .review")
                    count = await items.count()
                    if count == 0:
                        break

                    for i in range(count):
                        if len(reviews) >= max_reviews:
                            break
                        item = items.nth(i)

                        # Content: span inside .review-comment
                        content = ""
                        try:
                            text_el = item.locator(".review-comment span").last
                            if await text_el.count():
                                content = (await text_el.inner_text()).strip()
                        except Exception:
                            pass
                        if not content:
                            continue

                        # Trendyol uses CSS-only star rendering — not extractable from DOM
                        rating: int | None = None

                        # Date: .detail-item.date has 3 spans: day, month, year
                        review_date: date | None = None
                        try:
                            date_spans = item.locator(".detail-item.date span")
                            if await date_spans.count() >= 3:
                                day = await date_spans.nth(0).inner_text()
                                month = await date_spans.nth(1).inner_text()
                                year = await date_spans.nth(2).inner_text()
                                review_date = self._parse_date(day, month, year)
                        except Exception:
                            pass

                        reviews.append(ScrapedReview(
                            content=content,
                            rating=rating,
                            review_date=review_date,
                        ))

                    page_num += 1

            finally:
                await browser.close()

        return reviews
