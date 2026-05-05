"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSentiment } from "@/hooks/use-sentiment";

interface SentimentCardProps {
  productId: string;
}

function gaugeColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function gaugeLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Olumlu", color: "text-emerald-400" };
  if (score >= 40) return { text: "Karışık", color: "text-amber-400" };
  return { text: "Olumsuz", color: "text-red-400" };
}

function DistBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-white">%{pct}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SentimentCard({ productId }: SentimentCardProps) {
  const { data, isLoading, isError, error } = useSentiment(productId);

  const isNotReady =
    isError && (error as Error).message?.includes("henüz hazır değil");

  if (isNotReady) return null;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Duygu Analizi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            BERT-TR modeli · rule-based fallback
          </p>
        </div>
        {data && (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {data.total} yorum
          </span>
        )}
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {isError && !isNotReady && (
        <p className="text-sm text-slate-500 text-center py-6">
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
              <span className="font-bold text-white text-sm">{data.score}/100</span>
            </div>
            <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${gaugeColor(data.score)}`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2.5">
            <DistBar label="Pozitif" pct={data.positive_pct} color="bg-emerald-500" />
            <DistBar label="Nötr" pct={data.neutral_pct} color="bg-slate-400" />
            <DistBar label="Negatif" pct={data.negative_pct} color="bg-red-500" />
          </div>

          {/* Methodology note */}
          <p className="text-xs text-slate-600 bg-slate-700/30 rounded-lg px-3 py-2">
            Skor = (pozitif × 100 + nötr × 50) / toplam yorum.{" "}
            <span className="text-slate-500">
              Türkçeye özel fine-tuned BERT modeli kullanılmaktadır.
            </span>
          </p>

          {/* Trend chart */}
          {data.trend.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Son 30 gün trendi</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data.trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
                    }
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                    formatter={(v: number) => [`${v}/100`, "Skor"]}
                    labelFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#34d399"
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
              <p className="text-xs text-slate-500 font-medium">Sık geçen kelimeler</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.map(({ word, count }) => (
                  <span
                    key={word}
                    className="text-xs bg-slate-700/60 border border-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full"
                    title={`${count} kez geçiyor`}
                  >
                    {word}
                    <span className="ml-1 text-slate-500">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
