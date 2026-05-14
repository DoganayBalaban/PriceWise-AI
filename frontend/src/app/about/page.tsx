import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STACK = [
  { layer: "Frontend", items: ["Next.js 16", "React 19", "TailwindCSS v4", "TanStack Query"] },
  { layer: "Backend", items: ["FastAPI", "PostgreSQL", "Redis", "Alembic"] },
  { layer: "AI / ML", items: ["LangChain", "LangGraph", "Prophet", "BERT-TR + LoRA", "Pinecone"] },
  { layer: "Infra", items: ["AWS EC2", "Docker", "MLflow", "Render", "Vercel"] },
];

const TIMELINE = [
  { date: "Kasım 2025", event: "Proje başladı — fiyat takip MVP'si" },
  { date: "Ocak 2026", event: "Prophet tahmin motoru ve fiyat alarmları eklendi" },
  { date: "Şubat 2026", event: "RAG pipeline, LangGraph agent'ı tamamlandı" },
  { date: "Nisan 2026", event: "BERT-TR + LoRA fine-tuning tamamlandı (F1: 0.84)" },
  { date: "Mayıs 2026", event: "Kamuya açık beta başladı" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Hakkında</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          PriceWise AI nedir?
        </h1>
        <p className="text-muted-foreground leading-relaxed text-lg mb-12">
          Türkiye&apos;deki e-ticaret kullanıcılarının her alışveriş kararı için harcadığı ortalama
          23 dakikayı 23 saniyeye indirmek için yapılmış AI destekli alışveriş asistanı.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Problem</h2>
          <p className="text-muted-foreground leading-relaxed">
            Trendyol, Hepsiburada ve n11&apos;de aynı ürün farklı fiyatlarla satılır. Yorumlar
            yüzlerce sayfaya yayılmıştır. Fiyat geçmişi gizlidir. Kullanıcılar tarayıcıda
            ortalama 3 sekme, 47 yorum ve onlarca satıcıyla boğuşur. PriceWise AI bu kaosun
            içine girer, veriyi toplar, analiz eder ve net bir karar üretir.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Teknoloji yığını</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {STACK.map((s) => (
              <Card key={s.layer} className="p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{s.layer}</div>
                <div className="flex flex-wrap gap-1.5">
                  {s.items.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Yol Haritası</h2>
          <div className="relative pl-4 border-l border-border space-y-6">
            {TIMELINE.map((t) => (
              <div key={t.date}>
                <div className="text-xs font-mono text-muted-foreground mb-0.5">{t.date}</div>
                <div className="text-sm text-foreground">{t.event}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">İletişim</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Sorularınız, iş birliği teklifleriniz veya geri bildirimleriniz için:
          </p>
          <a
            href="mailto:hello@pricewise.ai"
            className="text-primary hover:underline text-sm font-medium"
          >
            hello@pricewise.ai
          </a>
        </section>

        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
          <Link href="/docs" className="hover:text-foreground">Dokümantasyon →</Link>
        </div>
      </div>
    </div>
  );
}
