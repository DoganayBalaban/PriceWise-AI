import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bot,
  Brain,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
                background:
                  "linear-gradient(90deg, hsl(221 83% 53%), hsl(262 83% 58%))",
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
            Trendyol, Hepsiburada ve n11&apos;deki ürünlerin fiyat trendini, yorum
            güvenilirliğini ve doğru satın alma zamanını saniyeler içinde öğrenin.
          </p>

          {/* URL input */}
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

        {/* Demo chrome */}
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
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Özellikler
          </div>
          <h2 className="text-4xl font-semibold tracking-tight">
            Akıllı satın alma kararı için her şey
          </h2>
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
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Nasıl Çalışır
            </div>
            <h2 className="text-4xl font-semibold tracking-tight">
              URL&apos;den karara, 4 adımda
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {HOW_STEPS.map((s, i) => (
              <StepCard key={i} idx={i + 1} {...s} />
            ))}
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
            Beta dönemi süresince Pro plan %50 indirimli. Şimdi katıl, ücretsiz 5
            analiz hakkıyla başla.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="h-11 px-6 rounded-lg bg-white text-blue-600 font-medium text-sm hover:bg-white/95 transition-colors"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="#pricing"
              className="h-11 px-6 rounded-lg bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors"
            >
              Planları Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo />
          <div>© 2026 PriceWise AI · Doğanay tarafından İstanbul&apos;da yapıldı 🇹🇷</div>
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
      <span className="font-semibold text-sm tracking-tight text-foreground">
        PriceWise AI
      </span>
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
      <div className="text-xs font-mono text-primary mb-3">
        {String(idx).padStart(2, "0")}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
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
              <Badge variant="outline" className="text-[10px] mb-1">
                Trendyol
              </Badge>
              <div className="text-sm font-medium">Galaxy Buds2 Pro</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Mevcut fiyat</div>
            <div className="text-2xl font-semibold">₺2.499</div>
            <div className="text-xs text-success flex items-center gap-1">
              ↓ %28 indirimli
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Karar</span>
              <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                Bekle
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              7 gün içinde ~₺120 düşüş bekleniyor
            </div>
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
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-end gap-1 pt-4">
            {[65, 72, 58, 80, 75, 68, 85, 78, 70, 88, 82, 74, 90, 85, 78].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background:
                      i >= 12
                        ? "hsl(221 83% 53% / 0.4)"
                        : "hsl(221 83% 53%)",
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
