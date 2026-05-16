"use client";

import { Bot, ChevronRight, Filter, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const HISTORY = [
  {
    id: 1,
    query: "Bu kulaklığı şimdi almalı mıyım?",
    product: "Samsung Galaxy Buds2 Pro",
    verdict: "WAIT" as const,
    date: "2 dakika önce",
    tokens: 1247,
  },
  {
    id: 2,
    query: "Bas kalitesi nasıl?",
    product: "Samsung Galaxy Buds2 Pro",
    verdict: null,
    date: "12 dakika önce",
    tokens: 412,
  },
  {
    id: 3,
    query: "iPhone ile uyumlu mu?",
    product: "Sony WH-1000XM5",
    verdict: null,
    date: "2 saat önce",
    tokens: 287,
  },
  {
    id: 4,
    query: "En ucuz hangisi?",
    product: "Apple AirPods Pro 2",
    verdict: "BUY" as const,
    date: "Dün, 14:32",
    tokens: 1102,
  },
  {
    id: 5,
    query: "Pil ömrü yeterli mi?",
    product: "Kindle Paperwhite",
    verdict: null,
    date: "2 gün önce",
    tokens: 198,
  },
  {
    id: 6,
    query: "Şimdi al, Pazartesi al?",
    product: "Logitech MX Master 3S",
    verdict: "BUY" as const,
    date: "3 gün önce",
    tokens: 891,
  },
];

type Verdict = "BUY" | "WAIT" | null;

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  if (!verdict) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold uppercase tracking-wide",
        verdict === "BUY"
          ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
          : "bg-[hsl(38_92%_50%/0.15)] text-[hsl(38_92%_45%)]"
      )}
    >
      {verdict === "BUY" ? "AL" : "BEKLE"}
    </span>
  );
}

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Geçmiş Analizler</h1>
          <p className="text-sm text-muted-foreground mt-1">Tüm sorgular ve agent oturumları</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-md border border-border text-xs hover:bg-muted inline-flex items-center gap-1.5 transition-colors">
            <Filter size={12} />
            Filtrele
          </button>
          <button className="h-9 px-3 rounded-md border border-border text-xs hover:bg-muted transition-colors">
            Son 30 gün
          </button>
        </div>
      </div>

      {/* History list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {HISTORY.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center gap-4 hover:bg-muted/40 cursor-pointer transition-colors"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  item.verdict
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.verdict ? <Bot size={16} /> : <MessageSquare size={16} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">&ldquo;{item.query}&rdquo;</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.product} · {item.tokens} token
                </div>
              </div>

              {/* Verdict */}
              <VerdictBadge verdict={item.verdict} />

              {/* Date */}
              <div className="text-xs text-muted-foreground w-32 text-right shrink-0">
                {item.date}
              </div>

              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Empty state hint at bottom */}
      {HISTORY.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Henüz bir analiz yapmadın. Ürün sayfasından başla.
        </div>
      )}
    </div>
  );
}
