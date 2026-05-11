import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Bell,
  Bot,
  Brain,
  Check,
  Code2,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Özellikler</a>
            <a href="#how" className="hover:text-foreground transition-colors">Nasıl Çalışır</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</a>
            <a href="#docs" className="hover:text-foreground transition-colors">Dokümantasyon</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center h-8 gap-1.5 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Giriş
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Ücretsiz Başla
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, hsl(221 83% 53% / 0.12), transparent 70%), radial-gradient(40% 40% at 80% 30%, hsl(262 83% 58% / 0.10), transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Türkiye&apos;nin ilk AI destekli alışveriş asistanı
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight max-w-4xl mx-auto"
            style={{ lineHeight: 1.05 }}
          >
            Almadan önce{" "}
            <span
              style={{
                background: "linear-gradient(90deg, hsl(221 83% 53%), hsl(262 83% 58%))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              AI&apos;a sor.
            </span>
            <br />
            Doğru zamanda al.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Trendyol, Hepsiburada ve n11&apos;deki ürünlerin fiyat trendini,
            yorum güvenilirliğini ve doğru satın alma zamanını saniyeler içinde öğrenin.
          </p>

          <div className="mt-10 max-w-2xl mx-auto">
            <div
              className="flex items-center gap-2 p-2 rounded-2xl border border-border bg-card"
              style={{ boxShadow: "0 8px 32px -8px hsl(221 83% 53% / 0.15)" }}
            >
              <div className="pl-3 text-muted-foreground">
                <LinkIcon size={16} />
              </div>
              <input
                defaultValue="https://www.trendyol.com/samsung/galaxy-buds2-pro-p-123456"
                readOnly
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              />
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                <Sparkles size={14} />
                Analiz et
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✓ Kredi kartı gerekmez</span>
              <span>✓ Aylık 5 ücretsiz analiz</span>
              <span>✓ 8 saniyede sonuç</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden"
            style={{ boxShadow: "0 50px 100px -20px hsl(221 83% 53% / 0.2)" }}
          >
            <MiniDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Özellikler</div>
          <h2 className="text-4xl font-semibold tracking-tight">Akıllı satın alma kararı için her şey</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Nasıl Çalışır</div>
            <h2 className="text-4xl font-semibold tracking-tight">URL&apos;den karara, 4 adımda</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {HOW_STEPS.map((s, i) => (
              <StepCard key={i} idx={i + 1} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Fiyatlandırma</div>
          <h2 className="text-4xl font-semibold tracking-tight">İhtiyacına göre başla</h2>
          <p className="mt-4 text-muted-foreground">
            Beta dönemi süresince Pro plan %50 indirimli.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>
      </section>

      {/* Docs */}
      <section id="docs" className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Dokümantasyon</div>
            <h2 className="text-4xl font-semibold tracking-tight">Business API</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Business planı ile PriceWise analiz motorunu ürününüze native şekilde bağlayın.
              Üretim kullanımı için endpoint kapsamı, örnek payload, hata kodları ve webhook akışı hazır.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Base URL</div>
              <div className="text-sm font-mono">https://api.pricewise.ai/v1</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Authentication</div>
              <div className="text-sm font-mono">X-API-Key header</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Rate Limit</div>
              <div className="text-sm font-mono">1.000 req / gün</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Format</div>
              <div className="text-sm font-mono">JSON request/response</div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Auth */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code2 size={16} className="text-primary" />
                </div>
                <h3 className="font-semibold">Kimlik Doğrulama</h3>
              </div>
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
                  <Terminal size={12} className="text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">HTTP header</span>
                </div>
                <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto">
                  <code>{`X-API-Key: pw_live_xxxxxxxxxxxxx`}</code>
                </pre>
              </Card>
              <p className="text-sm text-muted-foreground">
                Business planına geçtiğinizde Ayarlar → API Anahtarları bölümünden üretebilirsiniz.
              </p>

              <div className="flex items-center gap-2 mt-8 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Terminal size={16} className="text-primary" />
                </div>
                <h3 className="font-semibold">Base URL</h3>
              </div>
              <Card className="p-0 overflow-hidden">
                <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto">
                  <code>{`https://api.pricewise.ai/v1`}</code>
                </pre>
              </Card>
            </div>

            {/* Endpoints */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers size={16} className="text-primary" />
                </div>
                <h3 className="font-semibold">Endpoint&apos;ler</h3>
              </div>
              {API_ENDPOINTS.map((ep, i) => (
                <EndpointRow key={i} {...ep} />
              ))}
            </div>
          </div>

          {/* Code example */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">Örnek İstek ve Yanıt</h3>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">cURL</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Ürün analizi</Badge>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
                <code>{`curl -X POST https://api.pricewise.ai/v1/products \\
  -H "X-API-Key: pw_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.trendyol.com/urun/p-123456"}'

# Response
{
  "id": "prod_abc123",
  "name": "Samsung Galaxy Buds2 Pro",
  "platform": "trendyol",
  "current_price": 2499,
  "currency": "TRY",
  "decision": {
    "action": "wait",
    "confidence": 0.82,
    "reason": "7 gün içinde ~₺120 düşüş bekleniyor",
    "forecast_price": 2379
  }
}`}</code>
              </pre>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/50 text-xs font-mono text-muted-foreground">
                HTTP status kodları
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between"><span>200 / 201</span><span className="text-muted-foreground">Başarılı işlem</span></div>
                <div className="flex items-center justify-between"><span>400</span><span className="text-muted-foreground">Geçersiz payload</span></div>
                <div className="flex items-center justify-between"><span>401</span><span className="text-muted-foreground">API anahtarı eksik/hatalı</span></div>
                <div className="flex items-center justify-between"><span>404</span><span className="text-muted-foreground">Ürün kaydı bulunamadı</span></div>
                <div className="flex items-center justify-between"><span>429</span><span className="text-muted-foreground">Günlük limit aşıldı</span></div>
                <div className="flex items-center justify-between"><span>500</span><span className="text-muted-foreground">Geçici servis hatası</span></div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/50 text-xs font-mono text-muted-foreground">
                Webhook örneği (price drop)
              </div>
              <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
                <code>{`{
  "event": "price.alert.triggered",
  "occurred_at": "2026-05-11T08:33:20Z",
  "product_id": "prod_abc123",
  "target_price": 2399,
  "current_price": 2379,
  "platform": "trendyol",
  "url": "https://www.trendyol.com/urun/p-123456"
}`}</code>
              </pre>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/50 text-xs font-mono text-muted-foreground">
                Hızlı başlangıç
              </div>
              <div className="p-4 text-sm text-muted-foreground space-y-2">
                <p>1) Business plana geçin ve API key üretin.</p>
                <p>2) `POST /products` ile ürün URL&apos;sini gönderin.</p>
                <p>3) `GET /products/{`{id}`}/forecast` ile tahmini çekin.</p>
                <p>4) Alarm otomasyonu için `POST /webhooks/price-alert` endpoint&apos;ini yapılandırın.</p>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Business&apos;a Geç — API Anahtarı Al
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div
          className="rounded-3xl p-12 text-center text-white"
          style={{
            background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))",
          }}
        >
          <h2 className="text-4xl font-semibold tracking-tight">
            Bugünkü 23 dakikalık karşılaştırmayı 23 saniyeye indir.
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Beta dönemi süresince Pro plan %50 indirimli. Şimdi katıl, ücretsiz 5 analiz hakkıyla başla.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="flex justify-center items-center h-11 px-6 rounded-lg bg-white text-blue-600 font-medium text-sm hover:bg-white/95 transition-colors"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="#pricing"
              className="flex justify-center items-center h-11 px-6 rounded-lg bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors"
            >
              Planları Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                Türkiye&apos;nin ilk AI destekli alışveriş asistanı. Doğru ürünü, doğru fiyata, doğru zamanda al.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://twitter.com"
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors overflow-hidden bg-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://cdn.brandfetch.io/idS5WhqBbM/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1692089092800"
                    alt="X logo"
                    className="w-5 h-5 object-contain"
                  />
                </a>
                <a
                  href="https://github.com"
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors overflow-hidden bg-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://cdn.brandfetch.io/idZAyF9rlg/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1719469980739"
                    alt="GitHub logo"
                    className="w-4 h-4 object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Ürün</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</a></li>
                <li><a href="#docs" className="hover:text-foreground transition-colors">API Dokümantasyonu</a></li>
                <li><a href="#how" className="hover:text-foreground transition-colors">Nasıl Çalışır</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Şirket</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Hakkında</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="mailto:hello@pricewise.ai" className="hover:text-foreground transition-colors">İletişim</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Kaynaklar</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#docs" className="hover:text-foreground transition-colors">API Referansı</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Durum Sayfası</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Yasal</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Kullanım Koşulları</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Çerez Politikası</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">KVKK</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© 2026 PriceWise AI. Tüm hakları saklıdır.</span>
            <span>Trendyol, Hepsiburada ve n11, ilgili şirketlerin tescilli markalarıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
        <Zap size={14} className="text-primary-foreground" />
      </div>
      <span className="font-semibold text-sm tracking-tight text-foreground">PriceWise AI</span>
    </Link>
  );
}

const FEATURES = [
  {
    icon: TrendingUp,
    color: "hsl(221 83% 53%)",
    title: "Fiyat Tahmini",
    desc: "Prophet zaman serisi modeli, ürünün 7-30 gün sonraki fiyatını güven aralığıyla tahmin eder.",
  },
  {
    icon: MessageSquare,
    color: "hsl(262 83% 58%)",
    title: "RAG Yorum Analizi",
    desc: "Yorumlara doğal dilde soru sor — Pinecone + LangChain gerçek alıntılarla cevaplar.",
  },
  {
    icon: Bot,
    color: "hsl(142 71% 45%)",
    title: "Karar Agent'ı",
    desc: "LangGraph multi-node agent fiyat, yorum ve trend'i birleştirip \"Al / Bekle\" kararı üretir.",
  },
  {
    icon: Brain,
    color: "hsl(38 92% 50%)",
    title: "Türkçe Sentiment",
    desc: "BERT-TR + LoRA ile fine-tune edilmiş Türkçe sentiment modeli — argo ve emoji dahil.",
  },
  {
    icon: Layers,
    color: "hsl(0 84% 60%)",
    title: "Platform Karşılaştırma",
    desc: "Trendyol, Hepsiburada ve n11'deki güncel fiyatları tek ekranda paralel olarak getirir.",
  },
  {
    icon: Bell,
    color: "hsl(221 83% 53%)",
    title: "Akıllı Alarmlar",
    desc: "Belirlediğin hedef fiyatın altına düşünce e-posta — 15 dakika içinde haber.",
  },
];

function FeatureCard({
  icon: Icon,
  color,
  title,
  desc,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <Card className="p-6 hover:border-primary/40 transition-colors">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ background: `${color}1A`, color }}
      >
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </Card>
  );
}

const HOW_STEPS = [
  { title: "URL gir", desc: "Trendyol, Hepsiburada veya n11 ürün linkini yapıştır." },
  { title: "Veri toplanır", desc: "Playwright scraper fiyat geçmişi, satıcı ve yorumları çeker." },
  { title: "AI analiz eder", desc: "ML pipeline + RAG + LangGraph agent eş zamanlı çalışır." },
  { title: "Karar al", desc: "Al, Bekle, Alternatif öner — güven skoruyla beraber." },
];

function StepCard({ idx, title, desc }: { idx: number; title: string; desc: string }) {
  return (
    <Card className="p-6 relative">
      <div className="text-xs font-mono text-primary mb-3">{String(idx).padStart(2, "0")}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}

const PLANS = [
  {
    name: "Free",
    price: "₺0",
    period: "",
    desc: "Başlamak için ideal",
    highlight: false,
    badge: null,
    features: [
      "5 analiz / ay",
      "Fiyat geçmişi grafiği",
      "Temel fiyat tahmini",
      "Platform karşılaştırma",
      "E-posta fiyat alarmı",
    ],
    cta: "Ücretsiz Başla",
    href: "/register",
  },
  {
    name: "Pro",
    price: "₺199",
    period: "/ ay",
    desc: "Ciddi alışveriş yapanlar için",
    highlight: true,
    badge: "Beta %50 İndirim",
    features: [
      "100 analiz / ay",
      "RAG yorum analizi",
      "LangGraph karar agent'ı",
      "Türkçe sentiment skoru",
      "Öncelikli destek",
    ],
    cta: "Pro'ya Geç",
    href: "/register",
  },
  {
    name: "Business",
    price: "₺799",
    period: "/ ay",
    desc: "Entegrasyon ve ekipler için",
    highlight: false,
    badge: null,
    features: [
      "Sınırsız analiz",
      "REST API erişimi",
      "1.000 API isteği / gün",
      "Webhook desteği",
      "SLA + öncelikli destek",
    ],
    cta: "Satışla İletişim",
    href: "mailto:hello@pricewise.ai",
  },
];

function PricingCard({
  name,
  price,
  period,
  desc,
  highlight,
  badge,
  features,
  cta,
  href,
}: (typeof PLANS)[0]) {
  return (
    <Card
      className={`p-6 flex flex-col relative ${highlight ? "border-primary ring-1 ring-primary" : ""}`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground text-[10px] px-2.5">{badge}</Badge>
        </div>
      )}
      <div className="mb-5">
        <div className="text-sm font-semibold text-foreground mb-1">{name}</div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold">{price}</span>
          {period && <span className="text-sm text-muted-foreground mb-0.5">{period}</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
      <ul className="space-y-2.5 flex-1 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check size={14} className="text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`flex justify-center items-center h-9 rounded-lg text-sm font-medium transition-colors ${
          highlight
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border hover:bg-muted text-foreground"
        }`}
      >
        {cta}
      </Link>
    </Card>
  );
}

const API_ENDPOINTS = [
  { method: "POST", path: "/products", desc: "URL ile ürün kaydı açar ve ilk analizi tetikler" },
  { method: "GET", path: "/products/{id}", desc: "Ürün özeti, anlık fiyat ve son crawl durumunu döner" },
  { method: "GET", path: "/products/{id}/forecast", desc: "7/30 günlük fiyat tahmini ve güven skoru döner" },
  { method: "GET", path: "/products/{id}/sentiment", desc: "Türkçe sentiment dağılımı ve skorları döner" },
  { method: "GET", path: "/products/{id}/summary", desc: "Yorumlardan artı/eksi ve AI özetini döner" },
  { method: "POST", path: "/products/{id}/ask", desc: "Yorum verisi üzerinde RAG tabanlı soru-cevap çalıştırır" },
  { method: "POST", path: "/agent/analyze/{id}", desc: "Karar agent'ını çalıştırır (al / bekle / alternatif)" },
  { method: "GET", path: "/prices/{id}/compare", desc: "Trendyol, Hepsiburada, n11 fiyat karşılaştırması döner" },
  { method: "POST", path: "/webhooks/price-alert", desc: "Fiyat hedefe inince webhook bildirimi gönderir" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "hsl(142 71% 45%)",
  POST: "hsl(221 83% 53%)",
  DELETE: "hsl(0 84% 60%)",
  PATCH: "hsl(262 83% 58%)",
};

function EndpointRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const color = METHOD_COLORS[method] ?? "hsl(0 0% 60%)";
  return (
    <Card className="p-3 flex items-start gap-3">
      <span
        className="text-[10px] font-mono font-bold shrink-0 mt-0.5 w-10 text-center"
        style={{ color }}
      >
        {method}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-mono text-foreground truncate">{path}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </Card>
  );
}

function MiniDemo() {
  return (
    <div>
      <div className="h-9 px-4 border-b border-border flex items-center gap-2 bg-muted/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center text-[11px] font-mono text-muted-foreground">
          app.pricewise.ai/analyze
        </div>
      </div>
      <div className="p-6 grid grid-cols-3 gap-4" style={{ minHeight: 320 }}>
        <div className="col-span-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
              <Layers size={24} className="text-muted-foreground" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] mb-1">Trendyol</Badge>
              <div className="text-sm font-medium">Galaxy Buds2 Pro</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Mevcut fiyat</div>
            <div className="text-2xl font-semibold">₺2.499</div>
            <div className="text-xs text-success flex items-center gap-1">↓ %28 indirimli</div>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Karar</span>
              <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">Bekle</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">7 gün içinde ~₺120 düşüş bekleniyor</div>
          </div>
        </div>
        <div className="col-span-2 rounded-lg border border-border p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">Fiyat geçmişi & tahmin</div>
              <div className="text-sm font-medium">Son 30 gün + 7 gün tahmin</div>
            </div>
            <div className="flex gap-1">
              {["30g", "90g", "180g"].map((l, i) => (
                <button
                  key={l}
                  className={`h-7 px-2.5 text-xs rounded ${
                    i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-end gap-1 pt-4">
            {[65, 72, 58, 80, 75, 68, 85, 78, 70, 88, 82, 74, 90, 85, 78].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: i >= 12 ? "hsl(221 83% 53% / 0.4)" : "hsl(221 83% 53%)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
