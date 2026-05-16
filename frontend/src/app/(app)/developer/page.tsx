"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Clock, Copy, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {change && (
        <div className="text-xs text-muted-foreground mt-1">{change}</div>
      )}
    </div>
  );
}

const API_KEYS = [
  {
    name: "Production",
    key: "pw_live_a1b2c3...x9y8",
    last: "12 dakika önce",
    reqs: "12.4k",
  },
  {
    name: "Staging",
    key: "pw_test_z9y8x7...m1n2",
    last: "3 saat önce",
    reqs: "847",
  },
];

const ENDPOINTS = [
  { method: "POST", path: "/products", desc: "Ürün ekle" },
  { method: "GET", path: "/prices/{id}/forecast", desc: "7-30g tahmin" },
  { method: "POST", path: "/reviews/{id}/ask", desc: "RAG sor (SSE)" },
  { method: "POST", path: "/agent/analyze", desc: "Karar agent (SSE)" },
  { method: "GET", path: "/prices/{id}/compare", desc: "Multi-platform" },
];

const CURL_EXAMPLE = `curl -X POST https://api.pricewise.ai/v1/agent/analyze \\
  -H "Authorization: Bearer pw_live_a1b2c3..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_url": "https://www.trendyol.com/.../p-123456",
    "question": "Bu ürünü şimdi almalı mıyım?"
  }'

# Response (SSE stream)
data: {"type": "thinking", "node": "router"}
data: {"type": "tool_call", "tool": "predict_price", "result": {...}}
data: {"type": "decision", "verdict": "WAIT", "confidence": 0.81}
data: [DONE]`;

const PYTHON_EXAMPLE = `import pricewise

client = pricewise.Client(api_key="pw_live_a1b2c3...")

for event in client.agent.analyze(
    product_url="https://www.trendyol.com/.../p-123456",
    question="Bu ürünü şimdi almalı mıyım?",
    stream=True,
):
    print(event)`;

const NODE_EXAMPLE = `import PriceWise from "@pricewise/sdk";

const client = new PriceWise({ apiKey: "pw_live_a1b2c3..." });

const stream = await client.agent.analyze({
  productUrl: "https://www.trendyol.com/.../p-123456",
  question: "Bu ürünü şimdi almalı mıyım?",
});

for await (const event of stream) {
  console.log(event);
}`;

const CODE_TABS = [
  { label: "cURL", code: CURL_EXAMPLE },
  { label: "Python", code: PYTHON_EXAMPLE },
  { label: "Node", code: NODE_EXAMPLE },
];

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Developer API</h1>
          <p className="text-sm text-muted-foreground mt-1">
            PriceWise analizlerini kendi uygulamana entegre et · Business plan
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} />
          Yeni API key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="API çağrısı (bugün)" value="847" change="+12% dünden" icon={Activity} />
        <StatCard label="Ortalama latency" value="342ms" icon={Clock} />
        <StatCard label="Hata oranı" value="0.4%" icon={AlertTriangle} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: API Keys + Quickstart */}
        <div className="col-span-2 space-y-6">
          {/* API Keys */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-3">API Keys</h3>
            <div className="divide-y divide-border">
              {API_KEYS.map((k) => (
                <div key={k.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{k.name}</span>
                      <code className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {k.key}
                      </code>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Son kullanım: {k.last} · {k.reqs} istek
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(k.key, `copy-${k.name}`)}
                    title="Kopyala"
                    className="h-7 w-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground transition-colors"
                  >
                    <Copy size={13} className={copied === `copy-${k.name}` ? "text-success" : ""} />
                  </button>
                  <button
                    title="Sil"
                    className="h-7 w-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quickstart */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <h3 className="font-semibold text-sm">Quickstart</h3>
              <div className="flex gap-1 ml-auto">
                {CODE_TABS.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "h-7 px-2.5 text-xs rounded font-medium transition-colors",
                      activeTab === i
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <pre className="p-4 text-xs font-mono overflow-x-auto bg-muted/50 text-foreground leading-relaxed">
                {CODE_TABS[activeTab].code}
              </pre>
              <button
                onClick={() => handleCopy(CODE_TABS[activeTab].code, "quickstart")}
                className="absolute top-3 right-3 h-7 w-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground transition-colors"
                title="Kopyala"
              >
                <Copy size={13} className={copied === "quickstart" ? "text-success" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Endpoints + Rate Limit */}
        <div className="space-y-4">
          {/* Endpoints */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-3">Endpoint&apos;ler</h3>
            <div className="space-y-1">
              {ENDPOINTS.map((e) => (
                <div key={e.path} className="flex items-center gap-2 py-1.5 text-xs">
                  <span
                    className={cn(
                      "font-mono font-semibold w-12 text-[10px]",
                      e.method === "GET"
                        ? "text-[hsl(var(--success))]"
                        : "text-[hsl(var(--primary))]"
                    )}
                  >
                    {e.method}
                  </span>
                  <code className="flex-1 font-mono truncate text-muted-foreground">{e.path}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Limit */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-3">Rate Limit</h3>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Bugün</span>
              <span className="font-mono font-medium">847 / 1.000</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: "84.7%" }}
              />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">00:00 UTC&apos;de sıfırlanır</div>
          </div>
        </div>
      </div>
    </div>
  );
}
