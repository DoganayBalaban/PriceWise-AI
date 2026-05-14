"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Terminal, ChevronRight } from "lucide-react";
import { Logo } from "@/components/wave-w-logo";

// ── Sidebar nav structure ──────────────────────────────────
const NAV = [
  {
    group: "Başlangıç",
    items: [
      { id: "giris", label: "Giriş" },
      { id: "hizli-baslangic", label: "Hızlı Başlangıç" },
      { id: "authentication", label: "Authentication" },
    ],
  },
  {
    group: "API Referansı",
    items: [
      { id: "urunler", label: "Ürünler" },
      { id: "tahmin", label: "Fiyat Tahmini" },
      { id: "sentiment", label: "Sentiment" },
      { id: "rag", label: "RAG Soru-Cevap" },
      { id: "agent", label: "Karar Agent'ı" },
      { id: "karsilastirma", label: "Platform Karşılaştırma" },
      { id: "webhooks", label: "Webhooks" },
    ],
  },
  {
    group: "Genel",
    items: [
      { id: "rate-limits", label: "Rate Limits" },
      { id: "http-kodlari", label: "HTTP Kodları" },
      { id: "sdk", label: "SDK'lar" },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "hsl(142 71% 45%)",
  POST: "hsl(221 83% 53%)",
  DELETE: "hsl(0 84% 60%)",
  PATCH: "hsl(262 83% 58%)",
};

function Method({ m }: { m: string }) {
  return (
    <span
      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded"
      style={{ color: METHOD_COLORS[m], background: `${METHOD_COLORS[m]}18` }}
    >
      {m}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold tracking-tight mb-6 pb-3 border-b border-border">{title}</h2>
      {children}
    </div>
  );
}

function CodeBlock({ label, children }: { label?: string; children: string }) {
  return (
    <Card className="p-0 overflow-hidden my-4">
      {label && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
          <Terminal size={12} className="text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">{label}</span>
        </div>
      )}
      <pre className="p-5 text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </Card>
  );
}

function EndpointBlock({
  method,
  path,
  desc,
  params,
  example,
  response,
}: {
  method: string;
  path: string;
  desc: string;
  params?: { name: string; type: string; required?: boolean; desc: string }[];
  example?: string;
  response?: string;
}) {
  return (
    <div className="mb-8 pb-8 border-b border-border last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-3 mb-2">
        <Method m={method} />
        <code className="text-sm font-mono text-foreground">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      {params && params.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parametreler</div>
          <div className="rounded-lg border border-border overflow-hidden text-sm">
            {params.map((p, i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-2.5 border-b border-border last:border-0 bg-card">
                <code className="font-mono text-xs text-foreground w-36 shrink-0 mt-0.5">{p.name}</code>
                <span className="text-xs text-muted-foreground w-20 shrink-0 mt-0.5">{p.type}</span>
                {p.required && <Badge variant="outline" className="text-[9px] h-4 shrink-0">zorunlu</Badge>}
                <span className="text-xs text-muted-foreground">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {example && <CodeBlock label="cURL">{example}</CodeBlock>}
      {response && <CodeBlock label="Yanıt">{response}</CodeBlock>}
    </div>
  );
}

// ── Content sections ───────────────────────────────────────
function ContentGiris() {
  return (
    <Section title="Giriş">
      <p className="text-muted-foreground leading-relaxed mb-4">
        PriceWise AI, Türkiye&apos;deki e-ticaret ürünlerini analiz eden bir REST API&apos;dir.
        Fiyat geçmişi, tahmin, yorum analizi ve yapay zeka destekli alım kararlarına tek bir uç nokta
        ailesiyle erişebilirsiniz.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: "Base URL", value: "https://api.pricewise.ai/v1" },
          { label: "Format", value: "JSON (UTF-8)" },
          { label: "Auth", value: "X-API-Key header" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
            <code className="text-sm font-mono text-foreground">{item.value}</code>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ContentHizliBaslangic() {
  return (
    <Section title="Hızlı Başlangıç">
      <ol className="space-y-6 text-sm text-muted-foreground list-none">
        {[
          {
            step: "01",
            title: "Business planına geçin ve API anahtarı üretin",
            detail: 'Dashboard → Ayarlar → API Anahtarları → "Yeni Anahtar" butonuna tıklayın.',
          },
          {
            step: "02",
            title: "İlk isteği gönderin",
          },
          {
            step: "03",
            title: "Yanıtı işleyin",
            detail: "decision.action alanı al / bekle / alternatif değerlerinden birini döner.",
          },
        ].map((s) => (
          <li key={s.step} className="flex gap-4">
            <span className="font-mono text-xs text-primary mt-0.5 w-6 shrink-0">{s.step}</span>
            <div>
              <div className="font-medium text-foreground mb-1">{s.title}</div>
              {s.detail && <p>{s.detail}</p>}
              {s.step === "02" && (
                <CodeBlock label="cURL">{`curl -X POST https://api.pricewise.ai/v1/products \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.trendyol.com/urun/p-123456"}'`}</CodeBlock>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function ContentAuthentication() {
  return (
    <Section title="Authentication">
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Tüm istekler <code className="text-xs bg-muted px-1.5 py-0.5 rounded">X-API-Key</code> başlığını
        içermelidir. API anahtarları <strong>Business</strong> planına özeldir.
      </p>
      <CodeBlock label="Header">{`X-API-Key: pw_live_xxxxxxxxxxxxx`}</CodeBlock>
      <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
        <strong className="text-foreground">Güvenlik:</strong> API anahtarlarını istemci tarafı koduna
        (JavaScript, React vb.) eklemeyin. Tüm istekler sunucu tarafından yapılmalıdır.
      </div>
    </Section>
  );
}

function ContentUrunler() {
  return (
    <Section title="Ürünler">
      <EndpointBlock
        method="POST"
        path="/products"
        desc="Ürün URL'sini kaydeder, fiyat geçmişi crawl'ını ve ilk analizi tetikler."
        params={[
          { name: "url", type: "string", required: true, desc: "Trendyol, Hepsiburada veya n11 ürün sayfasının tam URL'si." },
        ]}
        example={`curl -X POST https://api.pricewise.ai/v1/products \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.trendyol.com/urun/p-123456"}'`}
        response={`{
  "id": "prod_abc123",
  "name": "Samsung Galaxy Buds2 Pro",
  "platform": "trendyol",
  "current_price": 2499,
  "currency": "TRY",
  "status": "analyzing"
}`}
      />
      <EndpointBlock
        method="GET"
        path="/products/{id}"
        desc="Ürün özeti, anlık fiyat ve son crawl durumunu döner."
        example={`curl https://api.pricewise.ai/v1/products/prod_abc123 \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx"`}
        response={`{
  "id": "prod_abc123",
  "name": "Samsung Galaxy Buds2 Pro",
  "platform": "trendyol",
  "current_price": 2499,
  "original_price": 3499,
  "discount_pct": 28,
  "in_stock": true,
  "last_crawled_at": "2026-05-14T10:20:00Z"
}`}
      />
    </Section>
  );
}

function ContentTahmin() {
  return (
    <Section title="Fiyat Tahmini">
      <p className="text-sm text-muted-foreground mb-6">
        Prophet zaman serisi modeliyle 7 ve 30 günlük fiyat tahminleri üretir. Güven aralığı ve tahmin güveni skoru döner.
      </p>
      <EndpointBlock
        method="GET"
        path="/products/{id}/forecast"
        desc="7/30 günlük fiyat tahmini ve güven aralığını döner."
        params={[
          { name: "days", type: "integer", desc: "Tahmin ufku: 7 veya 30. Varsayılan: 7." },
        ]}
        example={`curl "https://api.pricewise.ai/v1/products/prod_abc123/forecast?days=7" \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx"`}
        response={`{
  "forecast": [
    { "date": "2026-05-15", "price": 2450, "lower": 2380, "upper": 2520 },
    { "date": "2026-05-16", "price": 2420, "lower": 2340, "upper": 2500 },
    { "date": "2026-05-21", "price": 2379, "lower": 2310, "upper": 2450 }
  ],
  "confidence": 0.82,
  "trend": "downward"
}`}
      />
    </Section>
  );
}

function ContentSentiment() {
  return (
    <Section title="Sentiment Analizi">
      <p className="text-sm text-muted-foreground mb-6">
        BERT-TR + LoRA ile fine-tune edilmiş Türkçe sentiment modeli. Argo, kısaltmalar ve emoji desteklenir.
      </p>
      <EndpointBlock
        method="GET"
        path="/products/{id}/sentiment"
        desc="Yorum bazlı Türkçe sentiment dağılımı ve ortalama skoru döner."
        example={`curl https://api.pricewise.ai/v1/products/prod_abc123/sentiment \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx"`}
        response={`{
  "score": 78,
  "distribution": {
    "positive": 0.62,
    "neutral": 0.22,
    "negative": 0.16
  },
  "review_count": 127,
  "top_keywords": ["ses kalitesi", "bağlantı sorunu", "şarj süresi"]
}`}
      />
    </Section>
  );
}

function ContentRAG() {
  return (
    <Section title="RAG Soru-Cevap">
      <p className="text-sm text-muted-foreground mb-6">
        Pinecone + LangChain pipeline&apos;ı ile yorum verisine doğal dilde soru sorabilirsiniz.
        Yanıtlar gerçek yorum alıntılarıyla desteklenir.
      </p>
      <EndpointBlock
        method="POST"
        path="/products/{id}/ask"
        desc="Yorum verisi üzerinde RAG tabanlı soru-cevap çalıştırır."
        params={[
          { name: "question", type: "string", required: true, desc: "Kullanıcının doğal dildeki sorusu." },
        ]}
        example={`curl -X POST https://api.pricewise.ai/v1/products/prod_abc123/ask \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Ses kalitesi nasıl? Özellikle bass için ne diyorlar?"}'`}
        response={`{
  "answer": "Kullanıcıların %68'i ses kalitesinden memnun. Bass performansı genellikle 'dolgun ve etkileyici' olarak tanımlanıyor.",
  "sources": [
    { "text": "Bass sesi gerçekten çok güçlü, konserde gibi hissettiriyor", "rating": 5 },
    { "text": "Fiyatına göre bas sesi mükemmel", "rating": 4 }
  ],
  "confidence": 0.87
}`}
      />
    </Section>
  );
}

function ContentAgent() {
  return (
    <Section title="Karar Agent'ı">
      <p className="text-sm text-muted-foreground mb-6">
        LangGraph multi-node agent. Fiyat analisti → RAG reviewer → Decision node pipeline&apos;ı
        çalışır, ≤15 saniyede al / bekle / alternatif kararı üretir.
      </p>
      <EndpointBlock
        method="POST"
        path="/agent/analyze/{id}"
        desc="Karar agent'ını çalıştırır. Fiyat, yorum ve trend birleştirilir."
        example={`curl -X POST https://api.pricewise.ai/v1/agent/analyze/prod_abc123 \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx"`}
        response={`{
  "decision": {
    "action": "wait",
    "confidence": 0.82,
    "reason": "7 gün içinde ~₺120 düşüş bekleniyor. Sentiment skoru güçlü (78/100).",
    "forecast_price": 2379,
    "savings": 120
  },
  "signals": {
    "price_trend": "downward",
    "sentiment": 78,
    "review_count": 127
  },
  "elapsed_ms": 4820
}`}
      />
    </Section>
  );
}

function ContentKarsilastirma() {
  return (
    <Section title="Platform Karşılaştırma">
      <EndpointBlock
        method="GET"
        path="/prices/{id}/compare"
        desc="Trendyol, Hepsiburada ve n11 üzerindeki anlık fiyatları paralel olarak çeker ve karşılaştırır."
        example={`curl https://api.pricewise.ai/v1/prices/prod_abc123/compare \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx"`}
        response={`{
  "platforms": [
    { "name": "trendyol", "price": 2499, "in_stock": true, "url": "https://..." },
    { "name": "hepsiburada", "price": 2549, "in_stock": true, "url": "https://..." },
    { "name": "n11", "price": 2599, "in_stock": false, "url": "https://..." }
  ],
  "cheapest": "trendyol",
  "updated_at": "2026-05-14T10:20:00Z"
}`}
      />
    </Section>
  );
}

function ContentWebhooks() {
  return (
    <Section title="Webhooks">
      <p className="text-sm text-muted-foreground mb-4">
        Fiyat hedefine ulaşıldığında PriceWise AI, belirlediğiniz URL&apos;ye POST isteği gönderir.
        İmza doğrulaması için <code className="text-xs bg-muted px-1.5 py-0.5 rounded">X-PW-Signature</code> header&apos;ını kontrol edin.
      </p>
      <EndpointBlock
        method="POST"
        path="/webhooks/price-alert"
        desc="Bir ürün için fiyat alarmı tanımlar. Hedef fiyata ulaşıldığında belirtilen endpoint'e bildirim gönderilir."
        params={[
          { name: "product_id", type: "string", required: true, desc: "İzlenecek ürünün ID'si." },
          { name: "target_price", type: "number", required: true, desc: "Alarm eşiği (TRY)." },
          { name: "callback_url", type: "string", required: true, desc: "Bildirim gönderilecek HTTPS URL." },
        ]}
        example={`curl -X POST https://api.pricewise.ai/v1/webhooks/price-alert \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_id": "prod_abc123",
    "target_price": 2399,
    "callback_url": "https://yourdomain.com/hooks/price"
  }'`}
      />
      <div className="mt-2">
        <div className="text-sm font-medium mb-2">Webhook payload örneği</div>
        <CodeBlock label="POST → callback_url">{`{
  "event": "price.alert.triggered",
  "occurred_at": "2026-05-14T08:33:20Z",
  "product_id": "prod_abc123",
  "target_price": 2399,
  "current_price": 2379,
  "platform": "trendyol",
  "url": "https://www.trendyol.com/urun/p-123456"
}`}</CodeBlock>
      </div>
    </Section>
  );
}

function ContentRateLimits() {
  return (
    <Section title="Rate Limits">
      <div className="rounded-lg border border-border overflow-hidden text-sm">
        {[
          { plan: "Free", limit: "5 analiz / ay", api: "—" },
          { plan: "Pro", limit: "100 analiz / ay", api: "—" },
          { plan: "Business", limit: "Sınırsız analiz", api: "1.000 API isteği / gün" },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-border last:border-0 bg-card">
            <span className="font-medium text-foreground">{row.plan}</span>
            <span className="text-muted-foreground">{row.limit}</span>
            <span className="text-muted-foreground">{row.api}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        429 Too Many Requests yanıtı aldığınızda <code className="bg-muted px-1 rounded">Retry-After</code> header&apos;ını kontrol edin.
      </p>
    </Section>
  );
}

function ContentHTTP() {
  return (
    <Section title="HTTP Kodları">
      <div className="rounded-lg border border-border overflow-hidden text-sm">
        {[
          { code: "200", label: "OK", desc: "İstek başarılı." },
          { code: "201", label: "Created", desc: "Ürün başarıyla oluşturuldu." },
          { code: "400", label: "Bad Request", desc: "Geçersiz payload veya eksik parametre." },
          { code: "401", label: "Unauthorized", desc: "API anahtarı eksik veya hatalı." },
          { code: "404", label: "Not Found", desc: "Ürün kaydı bulunamadı." },
          { code: "422", label: "Unprocessable", desc: "URL geçersiz veya desteklenmeyen platform." },
          { code: "429", label: "Too Many Requests", desc: "Günlük veya aylık limit aşıldı." },
          { code: "500", label: "Server Error", desc: "Geçici servis hatası. Yeniden deneyin." },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-border last:border-0 bg-card items-start">
            <code className="font-mono text-xs font-semibold text-foreground">{row.code}</code>
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs text-muted-foreground">{row.desc}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ContentSDK() {
  return (
    <Section title="SDK'lar">
      <p className="text-sm text-muted-foreground mb-6">
        Resmi SDK&apos;lar geliştirme aşamasındadır. REST API&apos;yi direkt kullanabilirsiniz.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { lang: "Python", status: "Yakında", icon: "🐍" },
          { lang: "Node.js / TypeScript", status: "Yakında", icon: "🟨" },
          { lang: "Go", status: "Planlanıyor", icon: "🔵" },
          { lang: "PHP", status: "Planlanıyor", icon: "🐘" },
        ].map((sdk) => (
          <Card key={sdk.lang} className="p-4 flex items-center gap-4">
            <span className="text-2xl">{sdk.icon}</span>
            <div>
              <div className="font-medium text-sm">{sdk.lang}</div>
              <Badge variant="outline" className="text-[10px] mt-1">{sdk.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const CONTENT_MAP: Record<string, React.ReactNode> = {
  giris: <ContentGiris />,
  "hizli-baslangic": <ContentHizliBaslangic />,
  authentication: <ContentAuthentication />,
  urunler: <ContentUrunler />,
  tahmin: <ContentTahmin />,
  sentiment: <ContentSentiment />,
  rag: <ContentRAG />,
  agent: <ContentAgent />,
  karsilastirma: <ContentKarsilastirma />,
  webhooks: <ContentWebhooks />,
  "rate-limits": <ContentRateLimits />,
  "http-kodlari": <ContentHTTP />,
  sdk: <ContentSDK />,
};

export default function DocsPage() {
  const [active, setActive] = useState("giris");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/#features" className="hover:text-foreground transition-colors">Özellikler</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</Link>
            <Link href="/docs" className="text-foreground font-medium">Dokümantasyon</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex items-center h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Giriş
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Ücretsiz Başla <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-border sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 px-4 hidden md:block">
          {NAV.map((section) => (
            <div key={section.group} className="mb-6">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                {section.group}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActive(item.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                        active === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {active === item.id && <ChevronRight size={12} />}
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-6 pt-6 border-t border-border">
            <Link
              href="/register"
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              API Anahtarı Al
              <ArrowRight size={12} />
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 px-8 py-10 min-w-0">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground">Ana Sayfa</Link>
              <ChevronRight size={12} />
              <span className="text-foreground">Dokümantasyon</span>
            </div>

            {CONTENT_MAP[active] ?? <ContentGiris />}
          </div>
        </main>
      </div>
    </div>
  );
}
