"use client";

import { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useForecast } from "@/hooks/use-forecast";
import { Card } from "@/components/ui/card";

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const DAYS_OPTIONS = [7, 14, 30] as const;
type Days = (typeof DAYS_OPTIONS)[number];

const BADGE: Record<string, { label: string; color: string }> = {
  AL:             { label: "AL",           color: "bg-success/10 text-success border border-success/20" },
  BEKLE:          { label: "BEKLE",        color: "bg-destructive/10 text-destructive border border-destructive/20" },
  "TAKIPTE KAL":  { label: "TAKİPTE KAL", color: "bg-warning/10 text-warning border border-warning/20" },
};

interface ForecastCardProps {
  productId: string;
}

export function ForecastCard({ productId }: ForecastCardProps) {
  const [days, setDays] = useState<Days>(30);
  const { data, isLoading, isError } = useForecast(productId, days);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold">Fiyat Tahmini</h2>
        <div className="flex gap-1.5">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}g
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Tahmin oluşturulamadı — yeterli veri yok.
        </p>
      )}

      {data && (
        <>
          {data.low_confidence && (
            <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Az veriyle tahmin yapıldı — güven düşük ({data.data_points} veri noktası)
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Şu an</p>
              <p className="text-xl font-bold">{fmt.format(data.current_price)}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground hidden sm:block" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">{days} gün sonra (tahmin)</p>
              <p className="text-xl font-bold">{fmt.format(data.predicted_final_price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${BADGE[data.recommendation]?.color}`}>
                {BADGE[data.recommendation]?.label ?? data.recommendation}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={data.forecast} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v: number) => fmt.format(v)}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                formatter={(v, name) => {
                  if (name === "upper" || name === "lower") return null;
                  return [fmt.format(Number(v)), "Tahmin"];
                }}
                labelFormatter={(v) =>
                  new Date(String(v)).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
                }
              />
              {data.forecast[0]?.upper != null && (
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confidenceBand)"
                  activeDot={false}
                  legendType="none"
                />
              )}
              {data.forecast[0]?.lower != null && (
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="hsl(var(--background))"
                  activeDot={false}
                  legendType="none"
                />
              )}
              <Line
                type="monotone"
                dataKey="predicted_price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
              />
            </ComposedChart>
          </ResponsiveContainer>

          <p className="text-xs text-muted-foreground text-right">
            Ortalama hata (MAE): {fmt.format(data.mae)}
          </p>
        </>
      )}
    </Card>
  );
}
