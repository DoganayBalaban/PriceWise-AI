"use client";

import { useRef, useState } from "react";
import type { AgentDecision, AgentDecisionResult } from "@/types/agent";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type NodeStatus = "pending" | "running" | "done";

interface Step {
  node: string;
  label: string;
  status: NodeStatus;
}

const STEPS: Omit<Step, "status">[] = [
  { node: "router", label: "Soru Yönlendirme" },
  { node: "price_analyst", label: "Fiyat Analizi" },
  { node: "review_rag", label: "Yorum Analizi" },
  { node: "decision", label: "Karar Üretme" },
];

const DECISION_BADGE: Record<AgentDecision, { label: string; color: string; bar: string }> = {
  BUY: {
    label: "AL",
    color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    bar: "bg-emerald-500",
  },
  WAIT: {
    label: "BEKLE",
    color: "bg-red-500/20 text-red-400 border border-red-500/30",
    bar: "bg-red-500",
  },
  LOOK_FOR_ALTERNATIVE: {
    label: "ALTERNATİF ARA",
    color: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    bar: "bg-amber-500",
  },
};

async function getJwt(): Promise<string | null> {
  try {
    const res = await fetch(`${APP_URL}/api/auth/token`, { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

interface DecisionCardProps {
  productId: string;
}

export function DecisionCard({ productId }: DecisionCardProps) {
  const [started, setStarted] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [steps, setSteps] = useState<Step[]>(
    STEPS.map((s) => ({ ...s, status: "pending" as NodeStatus }))
  );
  const [result, setResult] = useState<AgentDecisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function resetState() {
    setSteps(STEPS.map((s) => ({ ...s, status: "pending" as NodeStatus })));
    setResult(null);
    setError(null);
  }

  function updateStep(node: string, status: NodeStatus) {
    setSteps((prev) => prev.map((s) => (s.node === node ? { ...s, status } : s)));
  }

  async function handleAnalyze() {
    if (streaming) return;
    resetState();
    setStarted(true);
    setStreaming(true);

    const token = await getJwt();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/api/agent/analyze/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ detail: "Bir hata oluştu" }));
        setError((err as { detail?: string }).detail ?? "Bir hata oluştu");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as Record<string, unknown>;

            if (event.type === "cached") {
              setResult(event.result as AgentDecisionResult);
              setSteps(STEPS.map((s) => ({ ...s, status: "done" as NodeStatus })));
            } else if (event.type === "node_start") {
              updateStep(event.node as string, "running");
            } else if (event.type === "node_done") {
              updateStep(event.node as string, "done");
            } else if (event.type === "final_decision") {
              const { type: _type, ...decisionData } = event;
              setResult(decisionData as unknown as AgentDecisionResult);
            } else if (event.type === "error") {
              setError(event.message as string);
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      }
    } finally {
      setStreaming(false);
    }
  }

  if (!started) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">AI Karar Asistanı</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fiyat tahmini ve yorum analizini birleştirerek Al / Bekle kararı üretir
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          Karar Al
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">AI Karar Asistanı</h2>
        {streaming ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
            Analiz ediliyor…
          </span>
        ) : (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Tamamlandı
          </span>
        )}
      </div>

      {/* Step list */}
      <div className="space-y-2.5">
        {steps.map((step) => (
          <div key={step.node} className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {step.status === "running" && (
                <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin" />
              )}
              {step.status === "done" && (
                <svg
                  className="text-emerald-400"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {step.status === "pending" && (
                <span className="w-2 h-2 rounded-full bg-slate-600" />
              )}
            </div>
            <span
              className={`text-sm transition-colors ${
                step.status === "done"
                  ? "text-slate-300"
                  : step.status === "running"
                  ? "text-white font-medium"
                  : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Final result */}
      {result && !streaming && (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span
              className={`text-base font-bold px-4 py-1.5 rounded-full ${
                DECISION_BADGE[result.decision]?.color ?? ""
              }`}
            >
              {DECISION_BADGE[result.decision]?.label ?? result.decision}
            </span>
            <div className="text-right">
              <p className="text-xs text-slate-500">Güven skoru</p>
              <p className="text-xl font-bold text-white">%{result.final_confidence}</p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                DECISION_BADGE[result.decision]?.bar ?? "bg-blue-500"
              }`}
              style={{ width: `${result.final_confidence}%` }}
            />
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{result.reasoning}</p>

          {result.errors.length > 0 && (
            <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 space-y-0.5">
              {result.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Yeniden analiz et
          </button>
        </div>
      )}
    </div>
  );
}
