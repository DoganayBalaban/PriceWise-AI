import re
from dataclasses import dataclass
from typing import Protocol

from playwright.async_api import Page, TimeoutError as PlaywrightTimeout
from playwright.async_api import async_playwright

_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


@dataclass
class ScrapedProduct:
    name: str
    current_price: float
    original_price: float | None
    discount_pct: float | None
    image_url: str | None
    in_stock: bool
    brand: str | None
    category: str | None


class BaseScraper:
    NAME_SELECTORS: list[str] = []
    CURRENT_PRICE_SELECTORS: list[str] = []
    ORIGINAL_PRICE_SELECTORS: list[str] = []
    IMAGE_SELECTORS: list[str] = []
    OUT_OF_STOCK_SELECTOR: str = ""
    WAIT_SELECTOR: str = "h1"
    # Extra ms to wait after domcontentloaded for JS-rendered content
    JS_SETTLE_MS: int = 2500

    def __init__(self, headless: bool = True) -> None:
        self.headless = headless

    def _parse_price(self, text: str) -> float | None:
        # Turkish locale: "1.425 TL" or "1.299,99 TL" → float
        cleaned = re.sub(r"[^\d,.]", "", text).replace(".", "").replace(",", ".")
        # Handle case where no comma existed (integer price like "1425")
        if cleaned.count(".") > 1:
            # Multiple dots means thousands separators were already stripped — keep as-is
            cleaned = cleaned.replace(".", "")
        try:
            return float(cleaned) if cleaned else None
        except ValueError:
            return None

    async def _first_text(self, page: Page, selectors: list[str]) -> str:
        for sel in selectors:
            el = page.locator(sel).first
            if await el.count() > 0:
                text = (await el.inner_text()).strip()
                if text:
                    return text
        return ""

    async def _first_image(self, page: Page, selectors: list[str]) -> str | None:
        for sel in selectors:
            el = page.locator(sel).first
            if await el.count() > 0:
                url = await el.get_attribute("src") or await el.get_attribute("content")
                if url:
                    return url
        return None

    async def scrape(self, url: str) -> ScrapedProduct:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=self.headless)
            try:
                ctx = await browser.new_context(user_agent=_USER_AGENT)
                page = await ctx.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=20_000)

                try:
                    await page.wait_for_selector(self.WAIT_SELECTOR, timeout=10_000)
                except PlaywrightTimeout:
                    raise RuntimeError(
                        f"{self.__class__.__name__} page did not load in time"
                    )

                # Allow JS-rendered content to settle
                await page.wait_for_timeout(self.JS_SETTLE_MS)

                name = await self._first_text(page, self.NAME_SELECTORS)

                price_text = await self._first_text(page, self.CURRENT_PRICE_SELECTORS)
                current_price = self._parse_price(price_text) if price_text else None

                orig_text = await self._first_text(page, self.ORIGINAL_PRICE_SELECTORS)
                original_price = self._parse_price(orig_text) if orig_text else None

                discount_pct: float | None = None
                if current_price and original_price and original_price > current_price:
                    discount_pct = round(
                        (1 - current_price / original_price) * 100, 1
                    )

                image_url = await self._first_image(page, self.IMAGE_SELECTORS)

                out_of_stock = page.locator(self.OUT_OF_STOCK_SELECTOR).first
                in_stock = (await out_of_stock.count()) == 0

                if not name or current_price is None:
                    raise RuntimeError(
                        f"Could not extract required fields from "
                        f"{self.__class__.__name__} page"
                    )

                return ScrapedProduct(
                    name=name,
                    current_price=current_price,
                    original_price=original_price,
                    discount_pct=discount_pct,
                    image_url=image_url,
                    in_stock=in_stock,
                    brand=None,
                    category=None,
                )
            finally:
                await browser.close()


class BaseScraperProtocol(Protocol):
    async def scrape(self, url: str) -> ScrapedProduct: ...
