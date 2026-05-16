"use client";

import { useState } from "react";
import { Bot, ChevronRight, Filter, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessions, useDeleteSession } from "@/hooks/use-sessions";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentSession } from "@/types/agent";

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dakika önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return "Dün";
  if (diffDay < 7) return `${diffDay} gün önce`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function VerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  if (!verdict) return null;
  const map: Record<string, { label: string; cls: string }> = {
    BUY: { label: "AL", cls: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]" },
    WAIT: { label: "BEKLE", cls: "bg-[hsl(38_92%_50%/0.15)] text-[hsl(38_92%_45%)]" },
    LOOK_FOR_ALTERNATIVE: { label: "ALTERNATİF", cls: "bg-muted text-muted-foreground" },
  };
  const meta = map[verdict];
  if (!meta) return null;
  return (
    <span className={cn("inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold uppercase tracking-wide", meta.cls)}>
      {meta.label}
    </span>
  );
}

function SessionRow({ session, onDelete }: { session: AgentSession; onDelete: (id: string) => void }) {
  const verdict = session.result?.decision ?? null;
  const tokens = session.result ? Object.keys(session.result).length : null;

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors group">
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        verdict ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Bot size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {session.product_name ?? "Ürün"}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {session.result?.reasoning
            ? session.result.reasoning.slice(0, 80) + (session.result.reasoning.length > 80 ? "…" : "")
            : "Analiz tamamlandı"}
          {session.tokens_used != null && ` · ${session.tokens_used} token`}
        </div>
      </div>

      <VerdictBadge verdict={verdict} />

      <div className="text-xs text-muted-foreground w-28 text-right shrink-0">
        {formatDate(session.created_at)}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-destructive transition-all shrink-0"
        title="Sil"
      >
        <Trash2 size={13} />
      </button>

      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="p-4 flex items-center gap-4">
      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

const PAGE_FILTERS = ["Son 7 gün", "Son 30 gün", "Tümü"] as const;

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<typeof PAGE_FILTERS[number]>("Son 30 gün");
  const { data: sessions, isLoading, isError } = useSessions(page);
  const { mutate: deleteSession } = useDeleteSession();

  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Geçmiş Analizler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tüm agent oturumları · {sessions ? `${sessions.length} kayıt` : "…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-md border border-border text-xs hover:bg-muted inline-flex items-center gap-1.5 transition-colors">
            <Filter size={12} />
            Filtrele
          </button>
          <div className="flex rounded-md border border-border overflow-hidden">
            {PAGE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-9 px-3 text-xs transition-colors border-r border-border last:border-r-0",
                  filter === f ? "bg-muted font-medium" : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Geçmiş yüklenemedi. Lütfen tekrar dene.
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="py-16 text-center">
            <Bot size={32} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium mb-1">Henüz analiz yok</p>
            <p className="text-xs text-muted-foreground">
              Ürün sayfasından AI agent başlat — burada görünür.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} onDelete={deleteSession} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {sessions && sessions.length === 20 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Önceki
          </button>
          <span className="h-9 px-4 inline-flex items-center text-sm text-muted-foreground">
            Sayfa {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
