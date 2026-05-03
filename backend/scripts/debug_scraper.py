"""Debug: Print page title + first 3000 chars of HTML to see what Trendyol serves."""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from playwright.async_api import async_playwright

_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

URL = "https://www.trendyol.com/effe-yapi-dekor/altin-metal-cerceveli-ayakli-boy-aynasi-180x60-cm-p-50446232"

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent=_USER_AGENT,
            viewport={"width": 1280, "height": 800},
        )
        page = await ctx.new_page()
        await page.goto(URL, wait_until="domcontentloaded", timeout=30_000)
        await page.wait_for_timeout(4000)

        title = await page.title()
        print(f"Title: {title}\n")

        # Check h1
        h1s = await page.locator("h1").all_inner_texts()
        print(f"H1 elements: {h1s}\n")

        # Check price-like elements
        for sel in [
            ".prc-dsc", ".prc-org", "[class*='prc-dsc']",
            ".price", "[class*='price']",
            ".product-price", "span[data-testid*='price']",
        ]:
            els = page.locator(sel)
            count = await els.count()
            if count:
                text = await els.first.inner_text()
                print(f"  {sel} ({count}): {text[:80]!r}")

        print("\n--- Page HTML snippet (first 2000 chars) ---")
        html = await page.content()
        print(html[:2000])
        await browser.close()

asyncio.run(main())
