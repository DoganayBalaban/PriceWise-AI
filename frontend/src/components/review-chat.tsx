"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface Source {
  text: string;
  rating: number | null;
  review_date: string;
  score: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  reviewsUsed?: number;
}

async function getJwt(): Promise<string | null> {
  try {
    const res = await fetch(`${APP_URL}/api/auth/token`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}

const POLL_INTERVAL = 5_000;
const POLL_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export function ReviewChat({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const pollStartRef = useRef<number | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: queryKeys.reviews.status(productId),
    queryFn: () => api.reviews.getStatus(productId),
    staleTime: 30_000,
    refetchInterval: (query) => {
      const data = query.state.data as { rag_ready?: boolean } | undefined;
      if (data?.rag_ready) return false;
      if (pollStartRef.current === null) pollStartRef.current = Date.now();
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT) return false;
      return POLL_INTERVAL;
    },
  });

  const prevRagReady = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (status?.rag_ready && prevRagReady.current === false) {
      toast.success("Yorumlar hazır! Artık soru sorabilirsiniz.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.status(productId) });
    }
    if (status !== undefined) prevRagReady.current = status.rag_ready;
  }, [status?.rag_ready, productId, queryClient]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function handleAsk() {
    const question = input.trim();
    if (!question || streaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setStreaming(true);
    setStreamingText("");

    const token = await getJwt();
    let fullText = "";
    let sources: Source[] = [];
    let reviewsUsed = 0;

    try {
      const res = await fetch(`${API_URL}/api/reviews/${productId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ detail: "Bir hata oluştu" }));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: err.detail ?? "Bir hata oluştu" },
        ]);
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
            const event = JSON.parse(line.slice(6));
            if (event.type === "chunk") {
              fullText += event.text;
              setStreamingText(fullText);
            } else if (event.type === "sources") {
              sources = event.sources ?? [];
              reviewsUsed = event.total_reviews_used ?? 0;
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Bağlantı hatası. Lütfen tekrar deneyin." },
      ]);
      return;
    } finally {
      setStreaming(false);
      setStreamingText("");
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: fullText, sources, reviewsUsed },
    ]);
  }

  if (statusLoading) return null;

  if (!status || status.total === 0 || !status.rag_ready) {
    const label = !status || status.total === 0
      ? "Yorumlar çekiliyor…"
      : `${status.total} yorum bulundu, AI indeksi hazırlanıyor… (${status.embedded}/${status.total})`;

    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Yorumlara Sor
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
            Hazırlanıyor
          </span>
        </div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xs text-slate-600 mt-1">Sayfa açık kaldığı sürece otomatik güncellenecek.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Yorumlara Sor</h3>
          <p className="text-xs text-slate-500 mt-0.5">{status.total} yoruma dayalı AI analizi</p>
        </div>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Hazır
        </span>
      </div>

      {/* Message history */}
      <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
        {messages.length === 0 && !streaming && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">Örnek sorular:</p>
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="block w-full text-left text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : "space-y-3"}>
            {msg.role === "user" ? (
              <div className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%]">
                {msg.content}
              </div>
            ) : (
              <>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                  {msg.reviewsUsed != null && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({msg.reviewsUsed} yorumdan üretildi)
                    </span>
                  )}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Kaynak yorumlar:</p>
                    <div className="space-y-1.5">
                      {msg.sources.map((src, j) => (
                        <SourceCard key={j} source={src} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Streaming in progress */}
        {streaming && (
          <div className="space-y-1">
            {streamingText ? (
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin" />
                Yorumlar analiz ediliyor…
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
            placeholder="Yorumlara bir şey sor…"
            disabled={streaming}
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleAsk}
            disabled={streaming || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {streaming ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
            Sor
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <div className="bg-slate-700/40 border border-slate-600/50 rounded-lg px-3 py-2 text-xs">
      <div className="flex items-center gap-2 mb-1">
        {source.rating && (
          <span className="text-yellow-400">{"★".repeat(source.rating)}{"☆".repeat(5 - source.rating)}</span>
        )}
        {source.review_date && (
          <span className="text-slate-500">{source.review_date}</span>
        )}
        <span className="ml-auto text-slate-600">%{Math.round(source.score * 100)} eşleşme</span>
      </div>
      <p className="text-slate-300 line-clamp-2">{source.text}</p>
    </div>
  );
}

const EXAMPLE_QUESTIONS = [
  "Bu ürünün en sık şikayeti ne?",
  "Kalite/fiyat dengesi nasıl?",
  "Uzun süreli kullanımda sorun çıkıyor mu?",
];
