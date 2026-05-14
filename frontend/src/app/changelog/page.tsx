import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const RELEASES = [
  {
    version: "0.5.0",
    date: "14 Mayıs 2026",
    tag: "beta",
    changes: [
      { type: "new", text: "Kamuya açık beta dönemi başladı" },
      { type: "new", text: "Lemon Squeezy ile freemium SaaS altyapısı tamamlandı" },
      { type: "new", text: "Better Auth ile Google OAuth entegrasyonu" },
      { type: "fix", text: "Render Docker deploy — Chromium yolu düzeltildi" },
    ],
  },
  {
    version: "0.4.0",
    date: "24 Nisan 2026",
    tag: "ml",
    changes: [
      { type: "new", text: "BERT-TR + LoRA fine-tuning tamamlandı (F1: 0.84, inference <180ms)" },
      { type: "new", text: "SentimentCard bileşeni — gauge, dağılım, trend, anahtar kelimeler" },
      { type: "improve", text: "MLflow ile model versiyonlama entegre edildi" },
    ],
  },
  {
    version: "0.3.0",
    date: "10 Mart 2026",
    tag: "ai",
    changes: [
      { type: "new", text: "LangGraph karar agent'ı — Router → Price → Review → Decision pipeline" },
      { type: "new", text: "RAG Soru-Cevap — Pinecone + LangChain, RAGAS faithfulness 0.78" },
      { type: "new", text: "Otomatik yorum özeti — artı/eksi listesi ve genel özet" },
      { type: "improve", text: "Streaming SSE desteği agent yanıtlarında" },
    ],
  },
  {
    version: "0.2.0",
    date: "20 Ocak 2026",
    tag: "forecast",
    changes: [
      { type: "new", text: "Prophet zaman serisi — 7 ve 30 günlük fiyat tahmini" },
      { type: "new", text: "Fiyat alarm sistemi — e-posta bildirimleri Resend ile" },
      { type: "new", text: "Redis cache katmanı (TTL: 1 saat)" },
      { type: "fix", text: "n11 scraper — rate limit aşımı düzeltildi" },
    ],
  },
  {
    version: "0.1.0",
    date: "15 Kasım 2025",
    tag: "mvp",
    changes: [
      { type: "new", text: "İlk MVP — Trendyol + Hepsiburada fiyat takibi" },
      { type: "new", text: "Playwright tabanlı scraper — ≤8sn scrape süresi" },
      { type: "new", text: "30/90/180 günlük fiyat geçmişi grafiği" },
      { type: "new", text: "FastAPI + Next.js temel stack" },
    ],
  },
];

const TYPE_STYLES = {
  new: { label: "Yeni", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  improve: { label: "İyileştirme", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  fix: { label: "Düzeltme", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
} as const;

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Changelog</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Sürüm Notları</h1>
        <p className="text-muted-foreground mb-12">Her sürümde yapılan değişiklikler.</p>

        <div className="space-y-12">
          {RELEASES.map((release) => (
            <div key={release.version} className="relative pl-6 border-l border-border">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono font-semibold text-foreground">v{release.version}</span>
                <Badge variant="outline" className="text-[10px]">{release.tag}</Badge>
                <span className="text-xs text-muted-foreground">{release.date}</span>
              </div>
              <ul className="space-y-2">
                {release.changes.map((change, i) => {
                  const style = TYPE_STYLES[change.type as keyof typeof TYPE_STYLES];
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Badge variant="outline" className={`text-[9px] h-4 mt-0.5 shrink-0 ${style.className}`}>
                        {style.label}
                      </Badge>
                      <span className="text-muted-foreground">{change.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
        </div>
      </div>
    </div>
  );
}
