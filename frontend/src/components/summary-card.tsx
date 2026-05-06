"use client";

import { useReviewSummary } from "@/hooks/use-review-summary";

interface SummaryCardProps {
  productId: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Yüksek Memnuniyet", color: "text-emerald-400" };
  if (score >= 40) return { text: "Orta Memnuniyet", color: "text-amber-400" };
  return { text: "Düşük Memnuniyet", color: "text-red-400" };
}

export function SummaryCard({ productId }: SummaryCardProps) {
  const { data, isLoading, isError, error } = useReviewSummary(productId);

  const isInsufficient =
    isError && (error as Error).message?.includes("en az 10 yorum");

  if (isInsufficient) return null;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">AI Yorum Özeti</h2>
        {data && (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Hazır
          </span>
        )}
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {isError && !isInsufficient && (
        <p className="text-sm text-slate-500 text-center py-6">Özet yüklenemedi.</p>
      )}

      {data && (
        <>
          {/* Satisfaction score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={scoreLabel(data.satisfaction_score).color}>
                {scoreLabel(data.satisfaction_score).text}
              </span>
              <span className="font-semibold text-white">{data.satisfaction_score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreColor(data.satisfaction_score)}`}
                style={{ width: `${data.satisfaction_score}%` }}
              />
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Artılar</p>
              {data.pros.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-slate-300"
                >
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Eksiler</p>
              {data.cons.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-slate-300"
                >
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Summary sentence */}
          <p className="text-sm text-slate-400 italic border-t border-slate-700 pt-3">
            &ldquo;{data.summary}&rdquo;
          </p>

          {/* Footer */}
          <p className="text-xs text-slate-600 text-right">
            {data.review_count} yorum analiz edildi ·{" "}
            {new Date(data.generated_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </>
      )}
    </div>
  );
}
