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
import { usePriceHistory, usePriceStats } from "@/hooks/use-price-history";

const DAY_OPTIONS = [
  { label: "30G", value: 30 },
  { label: "90G", value: 90 },
  { label: "180G", value: 180 },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

interface TooltipPayload {
  value: number;
  payload: { date: string; price: number };
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
      <p className="text-slate-400">{label}</p>
      <p className="text-white font-semibold">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

interface PriceChartProps {
  productId: string;
}

export function PriceChart({ productId }: PriceChartProps) {
  const [days, setDays] = useState(30);
  const { data: history, isLoading } = usePriceHistory(productId, days);
  const { data: stats } = usePriceStats(productId, days);

  const chartData = history?.map((entry) => ({
    date: new Date(entry.scraped_at).toLocaleDateString("tr-TR", {
      month: "short",
      day: "numeric",
    }),
    price: entry.price,
  }));

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Fiyat Geçmişi</h2>
        <div className="flex gap-1">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                days === opt.value
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 bg-slate-700/30 rounded-lg animate-pulse" />
      ) : !chartData || chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          Bu dönem için veri yok
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₺${v.toLocaleString("tr-TR")}`}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={chartData.length <= 10}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {stats && stats.data_points > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">En Düşük</p>
            <p className="text-sm font-semibold text-green-400">
              {stats.min_price != null ? formatPrice(stats.min_price) : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Ortalama</p>
            <p className="text-sm font-semibold text-slate-300">
              {stats.avg_price != null ? formatPrice(stats.avg_price) : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">En Yüksek</p>
            <p className="text-sm font-semibold text-red-400">
              {stats.max_price != null ? formatPrice(stats.max_price) : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
