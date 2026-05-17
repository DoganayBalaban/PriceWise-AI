import logging
import re
from datetime import date
from urllib.parse import quote_plus

from playwright.async_api import TimeoutError as PlaywrightTimeout
from playwright.async_api import async_playwright

from app.services.scraper.base import BaseScraper, ScrapedReview, _USER_AGENT

logger = logging.getLogger(__name__)

_MONTH_MAP = {
    "Ocak": 1,
    "Şubat": 2,
    "Mart": 3,
    "Nisan": 4,
    "Mayıs": 5,
    "Haziran": 6,
    "Temmuz": 7,
    "Ağustos": 8,
    "Eylül": 9,
    "Ekim": 10,
    "Kasım": 11,
    "Aralık": 12,
}


class N11Scraper(BaseScraper):
    WAIT_SELECTOR = "h1.proName, [itemprop='name'], h1"
    JS_SETTLE_MS = 3000

    NAME_SELECTORS = [
        "h1.proName",
        "[itemprop='name']",
        "h1",
    ]
    CURRENT_PRICE_SELECTORS = [
        ".newPrice ins",
        ".pricelabel .newPrice ins",
        ".priceBox .newPrice ins",
        "[itemprop='price']",
        ".prcBox ins",
    ]
    ORIGINAL_PRICE_SELECTORS = [
        ".oldPrice del",
        ".oldPriceTxt",
        ".priceBox .oldPrice del",
        ".prcBox del",
    ]
    IMAGE_SELECTORS = [
        "[itemprop='image']",
        ".prd-img-block img",
        ".imgBox img",
        ".big-img img",
    ]
    OUT_OF_STOCK_SELECTOR = (
        ".addToCartBox .soldOut, .outOfStock, [class*='soldOut'], "
        ".stokTukendi, .unavailable-product"
    )

    _SEARCH_URL = "https://www.n11.com/arama?q={query}"
    _SEARCH_RESULT_SELECTORS = [
        ".column.product a.mnLink",
        ".productList .columnContent a",
        "[class*='productItem'] a",
    ]

    async def search_first_result(self, query: str) -> str | None:
        search_url = self._SEARCH_URL.format(query=quote_plus(query))
        try:
            async with async_playwright() as pw:
                browser = await pw.chromium.launch(headless=self.headless)
                try:
                    ctx = await browser.new_context(user_agent=_USER_AGENT)
                    page = await ctx.new_page()
                    await page.goto(
                        search_url, wait_until="domcontentloaded", timeout=20_000
                    )
                    for sel in self._SEARCH_RESULT_SELECTORS:
                        try:
                            await page.wait_for_selector(sel, timeout=8_000)
                            href = await page.locator(sel).first.get_attribute("href")
                            if href:
                                if href.startswith("http"):
                                    return href
                                return f"https://www.n11.com{href}"
                        except PlaywrightTimeout:
                            continue
                    return None
                finally:
                    await browser.close()
        except Exception as exc:
            logger.warning("N11 search failed for %r: %s", query, exc)
            return None

    def _reviews_url(self, product_url: str, page_num: int) -> str:
        base = product_url.split("?")[0].rstrip("/")
        suffix = "/yorumlar-ve-degerlendirmeler"
        if not base.endswith(suffix):
            base += suffix
        if page_num > 1:
            return f"{base}?pg={page_num}"
        return base

    def _parse_date(self, text: str) -> date | None:
        text = text.strip()
        # "15 Ocak 2024" format
        parts = text.split()
        if len(parts) == 3:
            try:
                m = _MONTH_MAP.get(parts[1])
                if m:
                    return date(int(parts[2]), m, int(parts[0]))
            except (ValueError, KeyError):
                pass
        # "15.01.2024" or "2024-01-15" format
        for fmt_re, groups in [
            (
                r"(\d{2})\.(\d{2})\.(\d{4})",
                lambda m: date(int(m[3]), int(m[2]), int(m[1])),
            ),
            (
                r"(\d{4})-(\d{2})-(\d{2})",
                lambda m: date(int(m[1]), int(m[2]), int(m[3])),
            ),
        ]:
            match = re.search(fmt_re, text)
            if match:
                try:
                    return groups(match)
                except (ValueError, IndexError):
                    pass
        return None

    def _parse_rating(self, item_html: str) -> int | None:
        # n11 uses data-score attribute or filled star count
        score_match = re.search(r'data-score=["\']([1-5])["\']', item_html)
        if score_match:
            return int(score_match.group(1))
        filled = len(
            re.findall(r'class="[^"]*(?:full|filled|active|dolu)[^"]*"', item_html)
        )
        if 1 <= filled <= 5:
            return filled
        return None

    async def scrape_reviews(
        self, url: str, max_reviews: int = 100
    ) -> list[ScrapedReview]:
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
                seen_contents: set[str] = set()

                while len(reviews) < max_reviews and page_num <= 10:
                    await page.goto(
                        self._reviews_url(url, page_num),
                        wait_until="domcontentloaded",
                        timeout=25_000,
                    )
                    await page.wait_for_timeout(2500)
                    await page.evaluate(
                        "window.scrollTo(0, document.body.scrollHeight / 2)"
                    )
                    await page.wait_for_timeout(1000)

                    # Try multiple review container selectors
                    items = None
                    for container_sel in (
                        ".reviewItem",
                        ".commentItem",
                        ".review-item",
                        "[class*='reviewItem']",
                    ):
                        loc = page.locator(container_sel)
                        if await loc.count() > 0:
                            items = loc
                            break

                    if items is None or await items.count() == 0:
                        break

                    count = await items.count()
                    page_reviews: list[ScrapedReview] = []
                    for i in range(count):
                        if len(reviews) + len(page_reviews) >= max_reviews:
                            break
                        item = items.nth(i)
                        item_html = await item.inner_html()

                        content = ""
                        for content_sel in (
                            ".reviewContent",
                            ".commentText",
                            ".reviewText",
                            "p",
                        ):
                            el = item.locator(content_sel).first
                            if await el.count():
                                content = (await el.inner_text()).strip()
                                if content:
                                    break
                        if not content or content in seen_contents:
                            continue

                        rating = self._parse_rating(item_html)

                        review_date: date | None = None
                        for date_sel in (
                            ".reviewDate",
                            ".commentDate",
                            ".date",
                            "time",
                        ):
                            el = item.locator(date_sel).first
                            if await el.count():
                                dt_attr = await el.get_attribute("datetime")
                                date_text = dt_attr or (await el.inner_text()).strip()
                                if date_text:
                                    review_date = self._parse_date(date_text)
                                    break

                        seen_contents.add(content)
                        page_reviews.append(
                            ScrapedReview(
                                content=content,
                                rating=rating,
                                review_date=review_date,
                            )
                        )

                    if not page_reviews:
                        break

                    reviews.extend(page_reviews)
                    page_num += 1

            finally:
                await browser.close()

        return reviews
