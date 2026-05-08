<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />
<div align="center">
  <a href="https://github.com/DoganayBalaban/PriceWise-AI">
    <img src="https://img.shields.io/badge/PriceWise-AI-blue?style=for-the-badge&logo=robot&logoColor=white" alt="Logo" height="50">
  </a>

  <h3 align="center">PriceWise AI</h3>

  <p align="center">
    Türkiye'nin e-ticaret platformlarında fiyat takibi, tahmin ve akıllı yorum analizi yapan AI destekli SaaS uygulaması.
    <br />
    <a href="https://github.com/DoganayBalaban/PriceWise-AI"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/DoganayBalaban/PriceWise-AI/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/DoganayBalaban/PriceWise-AI/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## About The Project

PriceWise AI, Trendyol, Hepsiburada ve n11 gibi Türkiye'nin önde gelen e-ticaret sitelerindeki ürünleri takip eden, fiyat geçmişini analiz eden ve AI destekli kararlar üreten bir SaaS platformdur.

**Temel özellikler:**

- 🔍 **Fiyat Takibi** — Playwright ile Trendyol, Hepsiburada, n11 scraping; günlük otomatik güncelleme
- 📈 **Fiyat Tahmini** — Hibrit Prophet / LinearRegression modeli, güven aralığı bandıyla
- 🔔 **Fiyat Alarmı** — Hedef fiyata düşünce e-posta bildirimi (Resend)
- 💬 **RAG Chat** — Ürün yorumlarına LangChain + Pinecone ile doğal dil soruları
- 🧠 **LangGraph Agent** — Fiyat + yorum analizini birleştiren al/bekle karar motoru
- 😊 **Sentiment Analizi** — BERT-TR tabanlı pozitif/negatif/nötr yorum dağılımı
- 📊 **Rakip Karşılaştırma** — Aynı ürünü farklı platformlarda paralel sorgulama
- 💳 **Freemium SaaS** — Better Auth + Lemon Squeezy ile Free / Pro / Business planları

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![FastAPI][FastAPI]][FastAPI-url]
* [![Python][Python]][Python-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![Redis][Redis]][Redis-url]
* [![Docker][Docker]][Docker-url]
* [![TailwindCSS][TailwindCSS]][TailwindCSS-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

### Prerequisites

- **Docker & Docker Compose** — PostgreSQL, Redis çalıştırmak için
- **Node.js 20+** — Frontend
- **Python 3.11+** — Backend
- **Playwright** — Scraping için Chromium

```sh
# Playwright Chromium kurulumu
cd backend && .venv/bin/playwright install chromium
```

### Installation

1. Repo'yu klonla
   ```sh
   git clone https://github.com/DoganayBalaban/PriceWise-AI.git
   cd PriceWise-AI
   ```

2. Altyapıyı başlat (PostgreSQL + Redis)
   ```sh
   docker compose up -d postgres redis
   ```

3. Backend ortamını kur
   ```sh
   cd backend
   python -m venv .venv
   .venv/bin/pip install -r requirements.txt
   cp .env.example .env
   # .env dosyasını düzenle (aşağıdaki env var tablosuna bak)
   ```

4. Frontend bağımlılıklarını yükle
   ```sh
   cd frontend
   npm install
   ```

5. Her iki servisi paralel başlat
   ```sh
   # Proje kökünden
   make dev
   ```

   Backend `http://localhost:8000`, frontend `http://localhost:3000` adresinde çalışır.

#### Ortam Değişkenleri (`backend/.env`)

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı string'i |
| `REDIS_URL` | Redis bağlantı URL'i |
| `BETTER_AUTH_SECRET` | Better Auth JWT imzalama anahtarı |
| `BETTER_AUTH_URL` | Frontend URL (ör. `http://localhost:3000`) |
| `OPENAI_API_KEY` | RAG chat ve embedding için |
| `PINECONE_API_KEY` | Vektör veritabanı |
| `PINECONE_INDEX` | Pinecone index adı |
| `RESEND_API_KEY` | E-posta bildirimleri |
| `RESEND_FROM_EMAIL` | Gönderici adresi |
| `LEMON_SQUEEZY_API_KEY` | Abonelik yönetimi |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook imzalama |
| `LS_VARIANT_PRO` | Pro plan variant ID |
| `LS_VARIANT_BUSINESS` | Business plan variant ID |
| `APP_URL` | Uygulamanın public URL'i |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Usage

### Ürün Ekleme
Trendyol, Hepsiburada veya n11 ürün URL'sini panele yapıştır. Sistem otomatik olarak fiyatı çeker, geçmişi saklar ve 24 saatte bir günceller.

### Fiyat Tahmini
Ürün detay sayfasında 30 günlük Prophet tabanlı tahmin grafiği ve güven aralığı bandı görüntülenir.

### Fiyat Alarmı
Hedef fiyat belirle — mevcut fiyat bu değere düştüğünde e-posta alırsın (günde max 1 bildirim).

### AI Yorum Analizi
Ürün sayfasında yorumlara doğal dilde soru sor. RAG pipeline Pinecone'dan ilgili yorumları çekerek Claude ile cevap üretir.

### Al/Bekle Kararı
LangGraph agent, fiyat trendi + yorum sentiment'ini birleştirerek "Al", "Bekle" veya "Kaçır" önerisi üretir.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Roadmap

- [x] Trendyol + Hepsiburada scraper
- [x] n11 scraper
- [x] Fiyat geçmişi grafiği (30 / 90 / 180 gün)
- [x] Prophet hibrit tahmin modeli + güven bandı
- [x] Fiyat alarmı (e-posta)
- [x] Rakip fiyat karşılaştırma
- [x] RAG chat (LangChain + Pinecone)
- [x] Otomatik yorum özeti (Pros/Cons)
- [x] BERT-TR sentiment analizi
- [x] LangGraph al/bekle karar agent'ı
- [x] Better Auth (email + Google OAuth)
- [x] Lemon Squeezy ödeme (Pro + Business)
- [x] Günlük otomatik scraping (APScheduler)
- [ ] Fine-tuned Türkçe sentiment modeli (BERT-TR LoRA)
- [ ] Business API key sistemi
- [ ] n11 + Trendyol + Hepsiburada karşılaştırması (3 platform)
- [ ] Landing page & onboarding flow

See the [open issues](https://github.com/DoganayBalaban/PriceWise-AI/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contact

Doğanay Balaban — [LinkedIn](https://linkedin.com/in/doganaybalaban) — dbalaban1907@gmail.com

Project Link: [https://github.com/DoganayBalaban/PriceWise-AI](https://github.com/DoganayBalaban/PriceWise-AI)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Acknowledgments

* [LangChain](https://python.langchain.com/)
* [LangGraph](https://langchain-ai.github.io/langgraph/)
* [Playwright](https://playwright.dev/)
* [Prophet](https://facebook.github.io/prophet/)
* [Better Auth](https://www.better-auth.com/)
* [Lemon Squeezy](https://www.lemonsqueezy.com/)
* [Pinecone](https://www.pinecone.io/)
* [Best README Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/DoganayBalaban/PriceWise-AI.svg?style=for-the-badge
[contributors-url]: https://github.com/DoganayBalaban/PriceWise-AI/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/DoganayBalaban/PriceWise-AI.svg?style=for-the-badge
[forks-url]: https://github.com/DoganayBalaban/PriceWise-AI/network/members
[stars-shield]: https://img.shields.io/github/stars/DoganayBalaban/PriceWise-AI.svg?style=for-the-badge
[stars-url]: https://github.com/DoganayBalaban/PriceWise-AI/stargazers
[issues-shield]: https://img.shields.io/github/issues/DoganayBalaban/PriceWise-AI.svg?style=for-the-badge
[issues-url]: https://github.com/DoganayBalaban/PriceWise-AI/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/doganaybalaban

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[FastAPI]: https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi
[FastAPI-url]: https://fastapi.tiangolo.com/
[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://python.org/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Redis]: https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white
[Redis-url]: https://redis.io/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
