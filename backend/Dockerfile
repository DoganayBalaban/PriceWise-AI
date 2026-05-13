# Playwright'ın Python için optimize edilmiş resmi imajını kullanıyoruz
FROM mcr.microsoft.com/playwright/python:v1.45.0-jammy

# Tarayıcıları sabit bir yola kur — kullanıcıdan bağımsız olarak bulunabilsin
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Çalışma dizinini ayarla
WORKDIR /app

# Önce bağımlılıkları yükle (Docker cache avantajı için)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# pip ile kurulan playwright sürümü için doğru chromium'u indir
RUN playwright install chromium

# Proje dosyalarını kopyala
COPY . .

# Render genellikle 10000 portunu bekler, 
# ancak ortam değişkeninden okuması en sağlıklıdır.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]