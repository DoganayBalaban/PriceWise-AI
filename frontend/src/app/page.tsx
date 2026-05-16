"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Link as LinkIcon, Check, Loader2,
  TrendingUp, MessageSquare, Bot, Database, Cpu, Layers,
  Server, Layout, Brain, Globe, Activity, Zap, Star,
  ArrowDown, Bookmark, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ── Helpers ─────────────────────────────────────────────
function cx(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(" ");
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function useTicker(duration = 2000, active = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number, start: number;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, active]);
  return t;
}

// ── Price Chart Data ──────────────────────────────────────
function generatePriceData(seed: number, days: number, base: number, withForecast = false) {
  const data: { day: number; price: number | null; forecast: number | null }[] = [];
  let price = base;
  const r = (n: number) => Math.sin(seed * n * 7.3 + n * 1.7) * 0.5 + 0.5;
  for (let i = 0; i < days; i++) {
    price += (r(i) - 0.5) * 120;
    price = Math.max(base * 0.75, Math.min(base * 1.3, price));
    data.push({ day: i, price: Math.round(price), forecast: null });
  }
  if (withForecast) {
    let fp = data[data.length - 1].price!;
    for (let i = 1; i <= 7; i++) {
      fp -= r(days + i) * 25;
      data.push({ day: days + i, price: null, forecast: Math.round(fp) });
    }
  }
  return data;
}

// ── Badge ─────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline" | "primary";
function Bdg({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]",
    destructive: "bg-destructive/10 text-destructive",
    outline: "border border-border text-foreground",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

// ── Counter ───────────────────────────────────────────────
function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [ref, inView] = useInView();
  const t = useTicker(1800, inView);
  const eased = 1 - Math.pow(1 - t, 3);
  const val = inView ? to * eased : 0;
  return (
    <span ref={ref}>
      {val.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

// ── Logo ──────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
           style={{ background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="14 7 21 7 21 14" />
        </svg>
      </div>
      <span className="font-semibold tracking-tight text-[15px]">
        PriceWise<span className="text-primary"> AI</span>
      </span>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Özellikler</a>
          <a href="#how" className="hover:text-foreground transition-colors">Nasıl Çalışır</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</a>
          <Link href="/docs" className="hover:text-foreground transition-colors">Dokümantasyon</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="h-8 px-3 text-xs rounded-md font-medium hover:bg-muted inline-flex items-center transition-colors">
            Giriş
          </Link>
          <Link href="/register" className="h-8 px-4 text-xs rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 transition-colors">
            Ücretsiz Başla <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── URL Demo ──────────────────────────────────────────────
function UrlDemo() {
  const [phase, setPhase] = useState<"idle" | "scraping" | "done">("idle");
  const [phaseIdx, setPhaseIdx] = useState(0);

  const start = () => {
    setPhase("scraping");
    setPhaseIdx(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setPhaseIdx(i);
      if (i >= 4) { clearInterval(interval); setTimeout(() => setPhase("done"), 600); }
    }, 700);
  };

  const reset = () => { setPhase("idle"); setPhaseIdx(0); };

  const steps = [
    { label: "Platform tespit edildi", sub: "Trendyol" },
    { label: "Ürün bilgileri çekildi", sub: "Samsung Galaxy Buds2 Pro · ₺2.499" },
    { label: "Fiyat geçmişi alındı", sub: "47 nokta · son 30 gün" },
    { label: "Yorumlar embed edildi", sub: "127 yorum · Pinecone" },
  ];

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-2 rounded-2xl border border-border bg-card"
           style={{ boxShadow: "0 20px 60px -20px hsl(221 83% 53% / 0.25)" }}>
        <div className="pl-3 text-muted-foreground"><LinkIcon size={16} /></div>
        <input
          defaultValue="https://www.trendyol.com/samsung/galaxy-buds2-pro-p-123456"
          readOnly
          className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground"
        />
        {phase === "idle" && (
          <button onClick={start}
            className="h-9 px-4 text-sm rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 inline-flex items-center gap-2 transition-colors">
            <Sparkles size={14} /> Analizi başlat
          </button>
        )}
        {phase === "scraping" && (
          <button disabled
            className="h-9 px-4 text-sm rounded-xl bg-primary text-primary-foreground font-medium opacity-70 inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Tarıyor…
          </button>
        )}
        {phase === "done" && (
          <Link href="/dashboard"
            className="h-9 px-4 text-sm rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 inline-flex items-center gap-2 transition-colors">
            Sonucu gör <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {phase !== "idle" && (
        <div className="mt-4 p-4 rounded-xl border border-border bg-card">
          <div className="space-y-2">
            {steps.map((s, i) => {
              const done = i < phaseIdx;
              const active = i === phaseIdx;
              const pending = i > phaseIdx;
              return (
                <div key={i} className={cx("flex items-center gap-3 transition-all", pending ? "opacity-30" : "")}>
                  <div className={cx("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    done ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                    : active ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground")}>
                    {done ? <Check size={12} />
                    : active ? <Loader2 size={12} className="animate-spin" />
                    : <span className="w-1 h-1 rounded-full bg-current" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {phase === "done" && (
            <button onClick={reset} className="mt-3 text-[10px] text-muted-foreground hover:text-foreground">
              Sıfırla ve tekrar dene
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>✓ Kredi kartı gerekmez</span>
        <span>✓ Aylık 5 ücretsiz analiz</span>
        <span>✓ 8 saniyede sonuç</span>
      </div>
    </div>
  );
}

// ── Price Chart ───────────────────────────────────────────
function MiniPriceChart({ data, height = 220 }: { data: ReturnType<typeof generatePriceData>; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
          formatter={(v) => [`₺${Number(v)?.toLocaleString("tr-TR")}`, ""]}
          labelFormatter={() => ""}
        />
        <ReferenceLine x={30} stroke="hsl(var(--border))" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="price" stroke="hsl(221 83% 53%)" strokeWidth={2} fill="url(#priceGrad)" connectNulls={false} dot={false} />
        <Area type="monotone" dataKey="forecast" stroke="hsl(262 83% 58%)" strokeWidth={2} strokeDasharray="5 3" fill="url(#forecastGrad)" connectNulls={false} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Demo Tabs ─────────────────────────────────────────────
function DemoPrice() {
  const data = generatePriceData(3, 30, 2500, true);
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-mono shrink-0">IMG</div>
          <div>
            <Bdg variant="outline">Trendyol</Bdg>
            <div className="text-sm font-medium mt-1">Galaxy Buds2 Pro</div>
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ background: "linear-gradient(135deg, hsl(221 83% 53% / 0.08), hsl(262 83% 58% / 0.08))" }}>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Mevcut fiyat</div>
          <div className="text-3xl font-semibold mt-1 tracking-tight">₺2.499</div>
          <div className="text-xs text-[hsl(var(--success))] flex items-center gap-1 mt-1">
            <ArrowDown size={11} /> ₺1.000 indirim (%28)
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: "hsl(38 92% 50% / 0.3)", background: "hsl(38 92% 50% / 0.04)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">AI Karar</span>
            <Bdg variant="warning">%78 güven</Bdg>
          </div>
          <div className="text-xl font-semibold" style={{ color: "hsl(38 92% 45%)" }}>🟡 Bekle</div>
          <div className="text-[11px] text-muted-foreground mt-1">7 gün içinde ~₺120 düşüş bekleniyor</div>
        </div>
      </div>
      <div className="col-span-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Fiyat geçmişi & 7 günlük tahmin</div>
            <div className="text-sm font-medium mt-0.5">Prophet zaman serisi · MAE ₺47</div>
          </div>
          <div className="flex gap-1">
            {["30g", "90g", "180g"].map((l, i) => (
              <button key={l} className={cx("h-6 px-2 text-[10px] rounded font-medium transition-colors",
                i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <MiniPriceChart data={data} height={300} />
      </div>
    </div>
  );
}

function DemoRAG() {
  const [text, setText] = useState("");
  const fullText = "Kullanıcıların büyük çoğunluğu (%78) bas frekanslarından memnun. Özellikle ANC kapalıyken bas tonlarının dolgun olduğu öne çıkıyor. ANC açıkken bazı kullanıcılar basın hafif baskılandığını belirtmiş.";
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i === 0) setText("");
      i += 2;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
          Bu kulaklığın ses kalitesi nasıl? Bas frekansı yeterli mi?
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white"
             style={{ background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))" }}>
          <Sparkles size={14} />
        </div>
        <div className="flex-1 space-y-3">
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed">
            {text}
            <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 align-middle animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Bookmark size={11} /> Kaynak: 3 yorum · 412 token · Pinecone top-k=5
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { rating: 5, txt: "Bas sesi çok dolgun, müzik dinlemek için harika.", id: "rv_001" },
                { rating: 4, txt: "ANC açıkken bas biraz azalıyor ama yine de fena değil.", id: "rv_014" },
                { rating: 5, txt: "Equalizer'dan bas'ı +3 yapınca mükemmel oluyor.", id: "rv_087" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={10} style={n <= s.rating
                        ? { color: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" }
                        : { color: "hsl(var(--muted))", fill: "transparent" }} />
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed">&quot;{s.txt}&quot;</p>
                  <div className="font-mono text-[9px] text-muted-foreground mt-1.5">{s.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoAgent() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => s < 4 ? s + 1 : s), 900);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { node: "router", label: "Router Node", sub: "Soru sınıflandırılıyor", tool: null, result: null },
    { node: "price_analyst", label: "Price Analyst", sub: "Fiyat geçmişi analiz", tool: "predict_price()", result: "yhat: 2380" },
    { node: "review_rag", label: "Review RAG", sub: "Yorum chunks çekiliyor", tool: "rag_query()", result: "sentiment: 0.82" },
    { node: "decision", label: "Decision Node", sub: "Claude ile karar", tool: "claude.complete()", result: "verdict: WAIT" },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Cpu size={11} /> LangGraph pipeline · canlı yürütme
        </div>
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step - 1;
          return (
            <div key={i} className={cx("p-3 rounded-lg border transition-all",
              done ? "border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.04)]"
              : active ? "border-primary bg-primary/[0.06]"
              : "border-border opacity-50")}>
              <div className="flex items-center gap-3">
                <div className={cx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  done ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                  : active ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground")}>
                  {done ? <Check size={13} />
                  : active ? <Loader2 size={13} className="animate-spin" />
                  : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.label}</span>
                    <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.node}</code>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                </div>
                {s.tool && (done || active) && (
                  <div className="text-[10px] font-mono text-muted-foreground text-right">
                    <div>→ {s.tool}</div>
                    {s.result && done && <div className="text-[hsl(var(--success))]">{s.result}</div>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className={cx("rounded-xl p-5 transition-all", step >= 4 ? "" : "opacity-30")}
           style={{ background: "linear-gradient(135deg, hsl(38 92% 50% / 0.08), hsl(38 92% 50% / 0.02))", border: "1px solid hsl(38 92% 50% / 0.3)" }}>
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Final Karar</div>
        <div className="text-4xl font-semibold tracking-tight mt-2" style={{ color: "hsl(38 92% 45%)" }}>🟡 Bekle</div>
        <p className="text-xs text-foreground leading-relaxed mt-2">
          5–7 gün içinde fiyat ₺2.380&apos;a düşmesi bekleniyor. ~₺120 tasarruf.
        </p>
        <div className="mt-4 pt-4 border-t border-[hsl(38_92%_50%_/0.2)] space-y-1 text-[11px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Güven</span><span className="font-mono font-semibold">0.81</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span className="font-mono">8.4s</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Token</span><span className="font-mono">1.247</span></div>
        </div>
      </div>
    </div>
  );
}

function LiveDashboardDemo() {
  const [tab, setTab] = useState<"price" | "rag" | "agent">("price");
  const tabs = [
    { id: "price" as const, label: "Fiyat Tahmini", icon: TrendingUp },
    { id: "rag" as const, label: "Yorum Analizi", icon: MessageSquare },
    { id: "agent" as const, label: "Karar Agent", icon: Bot },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden"
         style={{ boxShadow: "0 50px 120px -30px hsl(221 83% 53% / 0.3)" }}>
      <div className="h-10 px-4 border-b border-border flex items-center gap-3 bg-muted/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center text-[11px] font-mono text-muted-foreground">app.pricewise.ai/p/galaxy-buds2-pro</div>
        <div className="flex gap-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cx("h-7 px-2.5 text-[11px] rounded font-medium inline-flex items-center gap-1.5 transition-colors",
                  tab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}>
                <Icon size={11} />{t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-6" style={{ minHeight: 480 }}>
        {tab === "price" && <DemoPrice />}
        {tab === "rag" && <DemoRAG />}
        {tab === "agent" && <DemoAgent />}
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
             style={{ background: "radial-gradient(circle, hsl(221 83% 53%), transparent 70%)", animation: "blob1 18s ease-in-out infinite" }} />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full opacity-25"
             style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent 70%)", animation: "blob2 22s ease-in-out infinite" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.06) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center top, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center top, black 30%, transparent 75%)"
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs mb-6">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[hsl(var(--success))] animate-ping opacity-75" />
            <span className="relative rounded-full bg-[hsl(var(--success))] w-2 h-2" />
          </span>
          Beta · Türkiye&apos;nin ilk AI destekli alışveriş asistanı
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight max-w-4xl mx-auto leading-[1.05]">
          Almadan önce{" "}
          <span style={{
            background: "linear-gradient(90deg, hsl(221 83% 53%), hsl(262 83% 58%), hsl(221 83% 53%))",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: "gradient-shift 4s ease-in-out infinite"
          }}>AI&apos;a sor.</span>
          <br />Doğru zamanda al.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Trendyol, Hepsiburada ve n11&apos;deki ürünlerin fiyat trendini, yorum güvenilirliğini ve doğru satın alma zamanını saniyeler içinde öğrenin.
        </p>

        <UrlDemo />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { v: 2847, label: "Beta kullanıcı", suffix: "+" },
            { v: 47000, label: "Analiz edilen ürün", suffix: "+" },
            { v: 1.2, label: "Milyon yorum", suffix: "M", decimals: 1 },
            { v: 8.4, label: "Ortalama yanıt", suffix: "s", decimals: 1 },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-semibold tracking-tight">
                <Counter to={s.v} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <LiveDashboardDemo />
      </div>
    </section>
  );
}

// ── Platform Marquee ──────────────────────────────────────
function PlatformMarquee() {
  const logos = ["Trendyol", "Hepsiburada", "n11", "Amazon TR", "Çiçeksepeti", "Pazarama"];
  return (
    <section className="border-y border-border py-10 bg-muted/20 overflow-hidden">
      <div className="text-center text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-6">
        Türkiye&apos;nin önde gelen e-ticaret platformlarında analiz yapın
      </div>
      <div className="relative">
        <div className="flex gap-12" style={{ animation: "marquee 30s linear infinite", width: "max-content" }}>
          {[...logos, ...logos, ...logos].map((name, i) => (
            <div key={i} className="text-2xl font-semibold text-muted-foreground whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity tracking-tight">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature Showcase ──────────────────────────────────────
function FeaturePriceVisual() {
  const [ref, inView] = useInView();
  const data = generatePriceData(7, 30, 2500, true);
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Galaxy Buds2 Pro</div>
          <div className="text-2xl font-semibold mt-1 tracking-tight">
            ₺2.499 <span className="text-xs text-[hsl(var(--success))]">→ ₺2.380</span>
          </div>
        </div>
        <Bdg variant="warning">🟡 7g bekle</Bdg>
      </div>
      {inView && <MiniPriceChart data={data} height={220} />}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Min", value: "₺2.349", green: false },
          { label: "Ort.", value: "₺2.612", green: false },
          { label: "7g", value: "−₺120", green: true },
        ].map((s) => (
          <div key={s.label} className="p-2 rounded bg-muted">
            <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">{s.label}</div>
            <div className={cx("text-sm font-semibold", s.green ? "text-[hsl(var(--success))]" : "")}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureRagVisual() {
  const [ref, inView] = useInView();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setStep(s => (s + 1) % 4), 1800);
    return () => clearInterval(id);
  }, [inView]);
  const questions = ["Bas frekansı nasıl?", "iPhone ile uyumlu mu?", "Şarj süresi yeterli mi?", "Kulaktan düşüyor mu?"];
  return (
    <div ref={ref}>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Database size={11} /> 1.248 yorum embed edildi · pinecone://galaxy-buds2-pro
      </div>
      <div className="rounded-xl border border-border bg-background p-3 mb-3">
        <div className="text-[10px] text-muted-foreground mb-1">Soru:</div>
        <div key={step} className="text-sm font-medium">{questions[step]}</div>
      </div>
      <div className="space-y-2">
        {[
          { rating: 5, txt: "Bas sesi çok dolgun, müzik dinlemek için harika.", sim: 0.92 },
          { rating: 4, txt: "ANC açıkken bas biraz azalıyor ama yine de fena değil.", sim: 0.87 },
          { rating: 5, txt: "Equalizer'dan bas'ı +3 yapınca mükemmel oluyor.", sim: 0.84 },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={9} style={n <= s.rating
                  ? { color: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" }
                  : { color: "hsl(var(--muted))", fill: "transparent" }} />
              ))}
            </div>
            <p className="text-[11px] flex-1 leading-relaxed">&quot;{s.txt}&quot;</p>
            <code className="font-mono text-[9px] text-primary shrink-0">sim {s.sim}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureAgentVisual() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">LangGraph DAG</div>
      <svg viewBox="0 0 400 280" width="100%" style={{ maxHeight: 260 }}>
        <defs>
          <marker id="arrow-feat" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="hsl(var(--border))" />
          </marker>
        </defs>
        {[
          { x1: 200, y1: 50, x2: 100, y2: 115, color: "hsl(221 83% 53%)" },
          { x1: 200, y1: 50, x2: 300, y2: 115, color: "hsl(221 83% 53%)" },
          { x1: 100, y1: 150, x2: 200, y2: 215, color: "hsl(262 83% 58%)" },
          { x1: 300, y1: 150, x2: 200, y2: 215, color: "hsl(262 83% 58%)" },
        ].map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-feat)">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.8s" repeatCount="indefinite" />
          </line>
        ))}
        {[
          { x: 200, y: 30, label: "Router", color: "hsl(221 83% 53%)" },
          { x: 80, y: 130, label: "Price", color: "hsl(142 71% 45%)" },
          { x: 320, y: 130, label: "Review RAG", color: "hsl(262 83% 58%)" },
          { x: 200, y: 230, label: "Decision", color: "hsl(38 92% 50%)" },
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x - 55} y={n.y - 18} width={110} height={36} rx={8} fill={n.color} />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={13} fontWeight={600} fill="white">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-3 p-3 rounded-lg bg-muted/50 font-mono text-[10px] text-muted-foreground">
        <div>data: {`{"type":"thinking","node":"router"}`}</div>
        <div>data: {`{"type":"tool_call","tool":"predict_price"}`}</div>
        <div>data: {`{"type":"decision","verdict":"WAIT","confidence":0.81}`}</div>
        <div className="text-[hsl(var(--success))]">data: [DONE]</div>
      </div>
    </div>
  );
}

function FeatureRow({ idx, title, desc, tags, visual, reverse }: {
  idx: string; title: string; desc: string; tags: string[];
  visual: React.ReactNode; reverse?: boolean;
}) {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className={cx(
      "grid md:grid-cols-2 gap-12 items-center py-16 border-t border-border transition-all duration-700 ease-out",
      inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    )}>
      <div className={cx(reverse ? "md:order-2" : "")}>
        <div className="text-xs font-mono text-primary mb-3">{idx}</div>
        <h3 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{title}</h3>
        <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">{desc}</p>
        <div className="flex gap-2 flex-wrap">
          {tags.map(t => (
            <code key={t} className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-foreground">{t}</code>
          ))}
        </div>
      </div>
      <div className={cx("rounded-2xl border border-border bg-card p-6 overflow-hidden relative", reverse ? "md:order-1" : "")}
           style={{ minHeight: 380, boxShadow: "0 20px 60px -20px hsl(var(--foreground) / 0.08)" }}>
        {visual}
      </div>
    </div>
  );
}

function FeatureShowcase() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Özellikler</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Bir alışveriş kararı için ihtiyaç duyduğun her şey.
        </h2>
      </div>
      <FeatureRow idx="01" title="Prophet zaman serisi ile fiyat tahmini"
        desc="Son 30-180 günlük fiyat verilerini analiz eder. 7 günlük tahmin + güven aralığı sunar. MAE skoru ile şeffaflık."
        tags={["Prophet", "MLflow", "Pandas"]} visual={<FeaturePriceVisual />} />
      <FeatureRow idx="02" title="RAG ile gerçek yoruma dayalı cevaplar"
        desc="Yorumları Pinecone vektör veritabanında saklar. Doğal dilde soru sor — top-5 yorumdan kaynak göstererek cevap üretir."
        tags={["LangChain", "Pinecone", "text-embedding-3"]} visual={<FeatureRagVisual />} reverse />
      <FeatureRow idx="03" title="Multi-agent karar pipeline'ı"
        desc="LangGraph ile yapılandırılmış 4 node: Router, Price Analyst, Review RAG, Decision. Tüm tool çağrıları görünür."
        tags={["LangGraph", "Claude Sonnet", "SSE Stream"]} visual={<FeatureAgentVisual />} />
    </section>
  );
}

// ── Comparison Slider ─────────────────────────────────────
function ComparisonSlider() {
  const [pos, setPos] = useState(50);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Karşılaştırma</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">23 dakika mı, 23 saniye mi?</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Slider&apos;ı sürükle — manuel karşılaştırma ile PriceWise AI&apos;ın farkını gör.
        </p>
      </div>
      <div className="relative rounded-2xl border border-border overflow-hidden select-none cursor-ew-resize"
           style={{ height: 480 }} onMouseMove={handleMouseMove}>
        <div className="absolute inset-0 bg-muted p-8">
          <div className="text-xs uppercase tracking-wider font-semibold text-destructive mb-2">😩 Eski yöntem</div>
          <div className="text-3xl font-semibold mb-8 tracking-tight">23 dakika · 3 sekme · belirsiz karar</div>
          <div className="grid grid-cols-3 gap-3 max-w-3xl">
            {["Trendyol", "Hepsiburada", "n11"].map(p => (
              <div key={p} className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">{p}</div>
                <div className="text-xl font-semibold mt-1">₺?</div>
                <div className="text-xs text-muted-foreground mt-2">⏳ 47 yorum okunmalı</div>
                <div className="text-xs text-muted-foreground">⏳ Fiyat geçmişi yok</div>
                <div className="text-xs text-muted-foreground">⏳ Manuel karar</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 p-8 overflow-hidden"
             style={{ clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)`, background: "linear-gradient(135deg, hsl(221 83% 53% / 0.04), hsl(262 83% 58% / 0.04))" }}>
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--success))] mb-2">✨ PriceWise AI</div>
          <div className="text-3xl font-semibold mb-8 tracking-tight">8 saniye · tek ekran · net karar</div>
          <div className="grid grid-cols-3 gap-3 max-w-3xl">
            {[
              { p: "Trendyol", price: 2499, tag: "7g düşüş bekleniyor", variant: "success" as const },
              { p: "Hepsiburada", price: 2389, tag: "En ucuz · kargo dahil ₺2.438", variant: "success" as const },
              { p: "n11", price: 2599, tag: "Yüksek · stokta yok", variant: "destructive" as const },
            ].map(p => (
              <div key={p.p} className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{p.p}</div>
                <div className="text-xl font-semibold mt-1">₺{p.price.toLocaleString("tr-TR")}</div>
                <div className="mt-2"><Bdg variant={p.variant}>{p.tag}</Bdg></div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-8 right-8 max-w-xs p-4 rounded-xl"
               style={{ border: "1px solid hsl(38 92% 50% / 0.3)", background: "hsl(38 92% 50% / 0.05)" }}>
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "hsl(38 92% 45%)" }}>AI Karar</div>
            <div className="text-2xl font-semibold mt-1" style={{ color: "hsl(38 92% 45%)" }}>🟡 Bekle</div>
            <div className="text-[11px] text-muted-foreground mt-1">~₺120 tasarruf, 7g sonra al</div>
          </div>
        </div>
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-0 bottom-0 w-px bg-foreground" style={{ left: "-0.5px" }} />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background shadow-xl">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-3">↔ Slider&apos;ı tıkla ve sürükle</div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────
function Testimonials() {
  const items = [
    { name: "Ali K.", role: "Beta kullanıcı · İstanbul", text: "Geçen ay Black Friday öncesi Sony WH-1000XM5 için \"Bekle\" dedi — 4 gün sonra ₺1.500 ucuzladı. Para iadesi gibi.", color: "#3B82F6" },
    { name: "Selin D.", role: "Beta kullanıcı · İzmir", text: "Yorumlara doğal dilde soru sormak değiştirdi. \"Bu robot süpürge halıda iyi mi?\" yazıyorum, kaynaklarla cevap geliyor.", color: "#EC4899" },
    { name: "Mert Y.", role: "Hacker News", text: "LangGraph + RAG kombinasyonu tam doğru kullanılmış. Türkçe sentiment modeli de bonus.", color: "#10B981" },
    { name: "Ayşe T.", role: "Beta kullanıcı · Ankara", text: "5 farklı kulaklığı karşılaştırırken 2 saatim giderdi. Artık 3 dakika. AI karar önerisi de güvende.", color: "#F59E0B" },
  ];
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Beta kullanıcıları</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Türkiye&apos;den ilk geri bildirimler.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((t, i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                     style={{ background: t.color }}>{t.name[0]}</div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed">&quot;{t.text}&quot;</p>
              <div className="flex gap-0.5 mt-3">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={12} style={{ color: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Free", price: "₺0", period: "/ay", desc: "Başlamak için ideal",
      features: ["5 analiz/ay", "Fiyat geçmişi", "Temel tahmin", "E-posta alarmı"],
      cta: "Ücretsiz başla", href: "/register", highlight: false,
    },
    {
      name: "Pro", price: "₺199", period: "/ay", desc: "Ciddi alışveriş yapanlar için",
      features: ["100 analiz/ay", "RAG yorum analizi", "LangGraph agent", "Öncelikli destek", "API erişimi (sınırlı)"],
      cta: "Pro'ya geç", href: "/register?plan=pro", highlight: true,
    },
    {
      name: "Business", price: "₺799", period: "/ay", desc: "Kurumsal ve geliştiriciler",
      features: ["Sınırsız analiz", "Tam API erişimi", "Webhook desteği", "SLA garantisi", "Özel entegrasyon"],
      cta: "İletişime geç", href: "mailto:hello@pricewise.ai", highlight: false,
    },
  ];
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Fiyatlandırma</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">İhtiyacına göre bir plan seç.</h2>
        <p className="mt-4 text-muted-foreground">Beta dönemi süresince Pro plan %50 indirimli.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map(plan => (
          <div key={plan.name} className={cx("rounded-2xl border p-8 flex flex-col relative",
            plan.highlight ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" : "border-border bg-card")}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">En Popüler</span>
              </div>
            )}
            <div className="mb-6">
              <div className="text-sm font-semibold text-muted-foreground mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{plan.desc}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-[hsl(var(--success))] shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href={plan.href}
                  className={cx("h-10 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors",
                    plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-muted")}>
              {plan.cta} <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Tech Stack ────────────────────────────────────────────
function TechStack() {
  const stack = [
    { name: "Next.js 16", icon: Layout, color: "#000" },
    { name: "FastAPI", icon: Server, color: "#009688" },
    { name: "LangGraph", icon: Layers, color: "#FF6B35" },
    { name: "Pinecone", icon: Database, color: "#0EA5E9" },
    { name: "Claude", icon: Brain, color: "#D97757" },
    { name: "Prophet", icon: TrendingUp, color: "#1877F2" },
    { name: "BERT-TR", icon: Cpu, color: "#FBBF24" },
    { name: "AWS", icon: Globe, color: "#FF9900" },
    { name: "MLflow", icon: Activity, color: "#0194E2" },
    { name: "PostgreSQL", icon: Database, color: "#336791" },
    { name: "Redis", icon: Zap, color: "#DC382D" },
    { name: "Playwright", icon: Bot, color: "#2EAD33" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Stack</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Modern AI + altyapı.</h2>
        <p className="mt-4 text-muted-foreground">Production-ready araçlarla inşa edildi.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {stack.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: s.color + "20", color: s.color }}>
                <Icon size={18} />
              </div>
              <span className="text-sm font-medium">{s.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────
function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))" }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }} />
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Bugünkü 23 dakikalık karşılaştırmayı{" "}
            <span className="underline decoration-white/40 decoration-4">23 saniyeye</span> indir.
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Beta dönemi süresince Pro plan %50 indirimli. Şimdi katıl, ücretsiz 5 analiz hakkıyla başla.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register"
                  className="h-12 px-8 rounded-lg bg-white text-primary font-medium text-sm hover:bg-white/95 inline-flex items-center gap-2 transition-colors">
              Ücretsiz başla <ArrowRight size={14} />
            </Link>
            <a href="#pricing"
               className="h-12 px-8 rounded-lg bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 inline-flex items-center transition-colors">
              Planları gör
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/70">
            <span>✓ Kredi kartı gerekmez</span>
            <span>✓ 30 saniyede kurulum</span>
            <span>✓ Anında iptal</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Ürün", items: [
      { label: "Özellikler", href: "#features" },
      { label: "Fiyatlandırma", href: "#pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Durum Sayfası", href: "/status" },
    ]},
    { title: "Geliştiriciler", items: [
      { label: "Dokümantasyon", href: "/docs" },
      { label: "API Referansı", href: "/docs" },
      { label: "Yardım Merkezi", href: "/help" },
    ]},
    { title: "Şirket", items: [
      { label: "Hakkımızda", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "İletişim", href: "mailto:hello@pricewise.ai" },
    ]},
    { title: "Yasal", items: [
      { label: "Gizlilik Politikası", href: "/privacy" },
      { label: "Kullanım Koşulları", href: "/terms" },
      { label: "Çerez Politikası", href: "/cookies" },
      { label: "KVKK", href: "/kvkk" },
    ]},
  ];
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <Logo />
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              Türkiye e-ticareti için yapay zeka destekli fiyat ve yorum asistanı.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3">{c.title}</div>
              <ul className="space-y-2">
                {c.items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© 2026 PriceWise AI · Doğanay tarafından İstanbul&apos;da yapıldı 🇹🇷</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-background">
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(0.95); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
      <Nav />
      <Hero />
      <PlatformMarquee />
      <FeatureShowcase />
      <ComparisonSlider />
      <Testimonials />
      <Pricing />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
}
