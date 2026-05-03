from datetime import date, datetime

from playwright.async_api import async_playwright

from app.services.scraper.base import BaseScraper, ScrapedReview, _USER_AGENT


class HepsiburadaScraper(BaseScraper):
    WAIT_SELECTOR = "h1[itemprop='name'], [data-testid='product-name'], h1"
    NAME_SELECTORS = [
        "h1[itemprop='name']",
        "[data-testid='product-name']",
        "h1.product-name",
        "h1",
    ]
    CURRENT_PRICE_SELECTORS = [
        "[data-testid='price-current']",
        ".product-price",
        "[itemprop='price']",
        ".currentPrice",
    ]
    ORIGINAL_PRICE_SELECTORS = [
        "[data-testid='price-original']",
        ".originalPrice",
        ".old-price",
    ]
    IMAGE_SELECTORS = [
        "[itemprop='image']",
        "[data-testid='product-image'] img",
        ".product-image img",
    ]
    OUT_OF_STOCK_SELECTOR = ".outOfStock, [data-testid='out-of-stock'], .stok-yok"

    # Review selectors
    _REVIEW_CONTAINER = [
        "[data-testid='ReviewCard']",
        "[class*='ReviewCard']",
        "[class*='review-card']",
        ".hermes-ReviewCard",
    ]
    _REVIEW_CONTENT = [
        "[data-testid='ReviewCard-description']",
        "[class*='ReviewCard-description']",
        "[class*='review-description']",
        "p.hermes-ReviewCard-description",
    ]
    _REVIEW_RATING = [
        "[data-testid='ReviewCard-rating']",
        "[class*='ReviewCard-rating']",
        "[class*='review-rating']",
    ]
    _REVIEW_DATE = [
        "[data-testid='ReviewCard-date']",
        "[class*='ReviewCard-date']",
        "[class*='review-date']",
        "time",
    ]
    _REVIEWS_TAB = [
        "[data-testid='tab-reviews']",
        "a[href*='yorumlar']",
        "button:has-text('Yorumlar')",
        "[class*='tab']:has-text('Yorum')",
    ]
    _NEXT_PAGE = [
        "[data-testid='pagination-next']",
        "button[aria-label='Sonraki sayfa']",
        "[class*='pagination'] button:last-child",
        ".hermes-Pagination-next",
    ]
    _LOAD_MORE = [
        "button:has-text('Daha Fazla Göster')",
        "[data-testid='load-more-reviews']",
        "button:has-text('Daha fazla')",
    ]

    def _parse_date(self, text: str) -> date | None:
        text = text.strip()
        month_map = {
            "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04",
            "Mayıs": "05", "Haziran": "06", "Temmuz": "07", "Ağustos": "08",
            "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12",
        }
        for tr_month, num in month_map.items():
            text = text.replace(tr_month, num)
        for fmt in ("%d %m %Y", "%d.%m.%Y", "%d/%m/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                continue
        return None

    async def scrape_reviews(self, url: str, max_reviews: int = 100) -> list[ScrapedReview]:
        reviews: list[ScrapedReview] = []

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=self.headless)
            try:
                ctx = await browser.new_context(user_agent=_USER_AGENT)
                page = await ctx.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=25_000)
                await page.wait_for_timeout(2000)

                # Try to click the reviews tab
                for tab_sel in self._REVIEWS_TAB:
                    try:
                        tab = page.locator(tab_sel).first
                        if await tab.count() > 0:
                            await tab.click()
                            await page.wait_for_timeout(1500)
                            break
                    except Exception:
                        continue

                page_num = 0
                while len(reviews) < max_reviews:
                    await page.wait_for_timeout(1000)

                    # Determine which container selector works
                    container_sel = None
                    for sel in self._REVIEW_CONTAINER:
                        if await page.locator(sel).count() > 0:
                            container_sel = sel
                            break

                    if not container_sel:
                        break

                    items = page.locator(container_sel)
                    count = await items.count()
                    if count == 0:
                        break

                    for i in range(count):
                        if len(reviews) >= max_reviews:
                            break
                        item = items.nth(i)

                        content = ""
                        for sel in self._REVIEW_CONTENT:
                            el = item.locator(sel).first
                            if await el.count() > 0:
                                content = (await el.inner_text()).strip()
                                if content:
                                    break
                        if not content:
                            continue

                        # Rating from aria-label or data attribute
                        rating: int | None = None
                        try:
                            for sel in self._REVIEW_RATING:
                                el = item.locator(sel).first
                                if await el.count() > 0:
                                    aria = await el.get_attribute("aria-label") or ""
                                    data = await el.get_attribute("data-score") or ""
                                    raw = data or aria
                                    import re
                                    m = re.search(r"([1-5])", raw)
                                    if m:
                                        rating = int(m.group(1))
                                        break
                                    # fallback: count filled stars in HTML
                                    html = await el.inner_html()
                                    filled = len(re.findall(r'full|filled|active', html))
                                    if 1 <= filled <= 5:
                                        rating = filled
                                        break
                        except Exception:
                            pass

                        # Date
                        review_date: date | None = None
                        for sel in self._REVIEW_DATE:
                            el = item.locator(sel).first
                            if await el.count() > 0:
                                date_text = (
                                    await el.get_attribute("datetime")
                                    or await el.inner_text()
                                ).strip()
                                review_date = self._parse_date(date_text)
                                if review_date:
                                    break

                        reviews.append(ScrapedReview(
                            content=content,
                            rating=rating,
                            review_date=review_date,
                        ))

                    # Try "load more" button first, then pagination
                    went_next = False
                    for sel in self._LOAD_MORE:
                        try:
                            btn = page.locator(sel).first
                            if await btn.count() > 0 and await btn.is_visible():
                                await btn.click()
                                await page.wait_for_timeout(1500)
                                went_next = True
                                break
                        except Exception:
                            continue

                    if not went_next:
                        for sel in self._NEXT_PAGE:
                            try:
                                btn = page.locator(sel).first
                                if await btn.count() > 0 and await btn.is_enabled():
                                    await btn.click()
                                    await page.wait_for_timeout(1500)
                                    went_next = True
                                    break
                            except Exception:
                                continue

                    page_num += 1
                    if not went_next or page_num >= 10:
                        break

            finally:
                await browser.close()

        return reviews
