"use client";

import { useReviewSummary } from "@/hooks/use-review-summary";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryCardProps {
  productId: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Yüksek Memnuniyet", color: "text-success" };
  if (score >= 40) return { text: "Orta Memnuniyet", color: "text-warning" };
  return { text: "Düşük Memnuniyet", color: "text-destructive" };
}

export function SummaryCard({ productId }: SummaryCardProps) {
  const { data, isLoading, isError, error } = useReviewSummary(productId);

  const isInsufficient =
    isError && (error as Error).message?.includes("en az 10 yorum");

  if (isInsufficient) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">AI Yorum Özeti</h2>
        {data && (
          <span className="text-xs bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full">
            Hazır
          </span>
        )}
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {isError && !isInsufficient && (
        <p className="text-sm text-muted-foreground text-center py-6">Özet yüklenemedi.</p>
      )}

      {data && (
        <>
          {/* Satisfaction score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={scoreLabel(data.satisfaction_score).color}>
                {scoreLabel(data.satisfaction_score).text}
              </span>
              <span className="font-semibold text-foreground">{data.satisfaction_score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreColor(data.satisfaction_score)}`}
                style={{ width: `${data.satisfaction_score}%` }}
              />
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-success uppercase tracking-wider">Artılar</p>
              {data.pros.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2 text-xs text-foreground"
                >
                  <span className="text-success mt-0.5 shrink-0">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-destructive uppercase tracking-wider">Eksiler</p>
              {data.cons.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-foreground"
                >
                  <span className="text-destructive mt-0.5 shrink-0">✗</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Summary sentence */}
          <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
            &ldquo;{data.summary}&rdquo;
          </p>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-right">
            {data.review_count} yorum analiz edildi ·{" "}
            {new Date(data.generated_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </>
      )}
    </Card>
  );
}
