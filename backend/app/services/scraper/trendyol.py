from app.services.scraper.base import BaseScraper


class TrendyolScraper(BaseScraper):
    WAIT_SELECTOR = "h1.product-title, h1"
    NAME_SELECTORS = [
        "h1.product-title",
        "h1.product-title.variant-pdp",
        "h1",
    ]
    CURRENT_PRICE_SELECTORS = [
        ".price.normal-price",
        ".price-wrapper .price",
        ".price-container .price",
        "[class*='price-wrapper']",
    ]
    ORIGINAL_PRICE_SELECTORS = [
        ".price.line-through",
        ".original-price",
        "[class*='original-price']",
        "[class*='price-line-through']",
    ]
    IMAGE_SELECTORS = [
        "[class*='product-image'] img",
        "[class*='gallery'] img",
        "img[class*='product']",
    ]
    OUT_OF_STOCK_SELECTOR = ".soldout-message, .out-of-stock, [class*='soldout']"
