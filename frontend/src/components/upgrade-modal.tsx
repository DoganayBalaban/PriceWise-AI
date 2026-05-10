"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleUpgrade(plan: "pro" | "business") {
    try {
      const data = await api.payments.getCheckoutUrl(plan);
      window.location.href = data.url;
    } catch {
      window.open("https://pricewise.lemonsqueezy.com", "_blank");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="upgrade-modal-title" className="text-lg font-bold">Ürün limitine ulaştınız</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ücretsiz planda en fazla 5 ürün takip edebilirsiniz.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <PlanOption
            name="Pro"
            price="₺199/ay"
            limit="100 ürün"
            highlight
            onSelect={() => handleUpgrade("pro")}
          />
          <PlanOption
            name="Business"
            price="₺799/ay"
            limit="Sınırsız ürün"
            onSelect={() => handleUpgrade("business")}
          />
        </div>

        <button
          onClick={onClose}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Şimdi değil
        </button>
      </div>
    </div>
  );
}

function PlanOption({
  name,
  price,
  limit,
  highlight = false,
  onSelect,
}: {
  name: string;
  price: string;
  limit: string;
  highlight?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors text-left ${
        highlight
          ? "bg-primary/10 border-primary/40 hover:border-primary/60"
          : "bg-muted/40 border-border hover:border-muted-foreground/30"
      }`}
    >
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{limit}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{price}</p>
        <p className="text-xs text-muted-foreground">Yükselt →</p>
      </div>
    </button>
  );
}
