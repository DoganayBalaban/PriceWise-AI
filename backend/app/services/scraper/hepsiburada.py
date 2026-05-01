from app.services.scraper.base import BaseScraper


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
