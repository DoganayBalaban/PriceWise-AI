# Playwright'ın Python için optimize edilmiş resmi imajını kullanıyoruz
FROM mcr.microsoft.com/playwright/python:v1.45.0-jammy

# Çalışma dizinini ayarla
WORKDIR /app

# Önce bağımlılıkları yükle (Docker cache avantajı için)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sadece ihtiyacımız olan tarayıcıyı (Chromium) kur
RUN playwright install chromium

# Proje dosyalarını kopyala
COPY . .

# Render genellikle 10000 portunu bekler, 
# ancak ortam değişkeninden okuması en sağlıklıdır.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]