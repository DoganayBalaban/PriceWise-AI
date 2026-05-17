"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { useSentiment } from "@/hooks/use-sentiment";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Card } from "@/components/ui/card";

interface SentimentCardProps {
  productId: string;
}

function gaugeColor(score: number) {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
}

function gaugeLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Olumlu", color: "text-success" };
  if (score >= 40) return { text: "Karışık", color: "text-warning" };
  return { text: "Olumsuz", color: "text-destructive" };
}

function DistBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">%{pct}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SentimentCard({ productId }: SentimentCardProps) {
  const { data, isLoading, isError, error, refetch } = useSentiment(productId);
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);

  const isNotReady =
    isError && (error as Error).message?.includes("henüz hazır değil");

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      await api.reviews.triggerSentimentAnalysis(productId);
      toast.success("Analiz başlatıldı, birkaç dakika içinde hazır olacak.");
      // Poll until data arrives
      const poll = setInterval(async () => {
        const result = await refetch();
        if (result.data) clearInterval(poll);
      }, 8_000);
      setTimeout(() => {
        clearInterval(poll);
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.sentiment(productId) });
      }, 3 * 60 * 1000);
    } catch {
      toast.error("Analiz başlatılamadı.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (isNotReady) {
    return (
      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Duygu Analizi</h2>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">🧠</div>
          <p className="text-sm font-medium">Analiz henüz yapılmadı</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Bu ürünün yorumları henüz duygu analizinden geçmemiş. Şimdi başlatabilirsin.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-1 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {analyzing && <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
            {analyzing ? "Analiz ediliyor…" : "Analizi Başlat"}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Duygu Analizi</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            BERT-TR modeli · rule-based fallback
          </p>
        </div>
        {data && (
          <span className="text-xs bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full">
            {data.total} yorum
          </span>
        )}
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {isError && !isNotReady && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Duygu analizi yüklenemedi.
        </p>
      )}

      {data && (
        <>
          {/* Gauge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={gaugeLabel(data.score).color}>
                {gaugeLabel(data.score).text}
              </span>
              <span className="font-bold text-foreground text-sm">{data.score}/100</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${gaugeColor(data.score)}`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2.5">
            <DistBar label="Pozitif" pct={data.positive_pct} color="bg-success" />
            <DistBar label="Nötr" pct={data.neutral_pct} color="bg-muted-foreground" />
            <DistBar label="Negatif" pct={data.negative_pct} color="bg-destructive" />
          </div>

          {/* Methodology note */}
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            Skor = (pozitif × 100 + nötr × 50) / toplam yorum.{" "}
            <span className="opacity-70">
              Türkçeye özel fine-tuned BERT modeli kullanılmaktadır.
            </span>
          </p>

          {/* Trend chart */}
          {data.trend.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Son 30 gün trendi</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data.trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
                    }
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    formatter={(v) => [`${v}/100`, "Skor"]}
                    labelFormatter={(v) =>
                      new Date(String(v)).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Keywords */}
          {data.keywords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Sık geçen kelimeler</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.map(({ word, count }) => (
                  <span
                    key={word}
                    className="text-xs bg-muted border border-border text-foreground px-2 py-0.5 rounded-full"
                    title={`${count} kez geçiyor`}
                  >
                    {word}
                    <span className="ml-1 text-muted-foreground">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
