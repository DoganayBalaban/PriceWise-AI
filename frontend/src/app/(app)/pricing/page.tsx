"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "₺0",
    period: "/ay",
    desc: "Kişisel kullanım için",
    features: [
      "5 analiz/ay",
      "Temel fiyat tahmini",
      "14 günlük geçmiş",
      "E-posta alarmı",
    ],
    cta: "Mevcut planın",
    current: true,
    popular: false,
    href: "#",
  },
  {
    name: "Pro",
    price: "₺199",
    period: "/ay",
    desc: "Aktif alışverişçiler için",
    features: [
      "100 analiz/ay",
      "Tüm AI özellikleri",
      "Sınırsız geçmiş",
      "RAG yorum analizi",
      "Multi-platform karşılaştırma",
      "Öncelikli destek",
    ],
    cta: "Pro'ya geç",
    current: false,
    popular: true,
    href: "/register?plan=pro",
  },
  {
    name: "Business",
    price: "₺799",
    period: "/ay",
    desc: "Geliştiriciler ve işletmeler",
    features: [
      "Sınırsız analiz",
      "REST API erişimi",
      "1.000 req/gün",
      "Webhook desteği",
      "Custom rate limit",
      "SLA + dedicated support",
    ],
    cta: "İletişime geç",
    current: false,
    popular: false,
    href: "mailto:hello@pricewise.ai",
  },
];

export default function PricingPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold tracking-tight mb-3">Sana uygun bir plan var</h1>
        <p className="text-sm text-muted-foreground">
          İstediğin zaman değiştir veya iptal et. Lemon Squeezy ile güvenli ödeme · Türk kartlarını kabul eder.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              "rounded-2xl border bg-card p-7 relative flex flex-col",
              p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"
            )}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide text-white"
                   style={{ background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))" }}>
                En popüler
              </div>
            )}

            <div className="text-sm font-semibold mb-1">{p.name}</div>
            <div className="text-xs text-muted-foreground mb-4">{p.desc}</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
              <span className="text-sm text-muted-foreground">{p.period}</span>
            </div>

            <Link
              href={p.href}
              className={cn(
                "w-full mb-6 h-10 rounded-lg text-sm font-medium inline-flex items-center justify-center transition-colors",
                p.current
                  ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                  : p.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border hover:bg-muted"
              )}
            >
              {p.cta}
            </Link>

            <ul className="space-y-2.5 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={14} className="text-[hsl(var(--success))] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-xs text-muted-foreground">
        KDV dahildir · İlk 30 gün koşulsuz iade garantisi
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold tracking-tight mb-6 text-center">Sık sorulan sorular</h2>
        <div className="space-y-4">
          {[
            { q: "Ücretsiz plan ne kadar sürer?", a: "Süresiz. 5 analiz/ay hakkın her ay yenilenir." },
            { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet, istediğin zaman, hiçbir ücret olmadan iptal edebilirsin." },
            { q: "Türk kartlarını kabul ediyor musunuz?", a: "Evet, Lemon Squeezy aracılığıyla tüm Türk kartlarını kabul ediyoruz." },
            { q: "Business API key nasıl alırım?", a: "Business plana geçtikten sonra Developer API sayfasından key oluşturabilirsin." },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-card p-5">
              <div className="text-sm font-medium mb-1">{item.q}</div>
              <div className="text-sm text-muted-foreground">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
