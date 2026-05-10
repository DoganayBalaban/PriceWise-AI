"use client";

import { toast } from "sonner";
import { Activity, ArrowRight, CreditCard, ExternalLink, User, Zap } from "lucide-react";
import { useMe, usePortal } from "@/hooks/use-me";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  free:     { label: "Free",     color: "hsl(var(--muted-foreground))", bg: "hsl(var(--muted))" },
  pro:      { label: "Pro",      color: "hsl(221 83% 53%)",             bg: "hsl(221 83% 53% / 0.1)" },
  business: { label: "Business", color: "hsl(262 83% 58%)",             bg: "hsl(262 83% 58% / 0.1)" },
};

export default function SettingsPage() {
  const { data: me, isLoading } = useMe();
  const { mutate: openPortal, isPending: isPortalPending } = usePortal();

  function handlePortal() {
    openPortal(undefined, {
      onError: (err: Error) => toast.error(err.message),
    });
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-7 w-28" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-3 w-16" />
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-2 w-full rounded-full" />
        </Card>
      </div>
    );
  }

  if (!me) return null;

  const plan = PLAN_META[me.plan] ?? PLAN_META.free;
  const quotaPct =
    me.queries_limit > 0
      ? Math.min((me.queries_used / me.queries_limit) * 100, 100)
      : 0;
  const quotaNear = quotaPct >= 80;

  return (
    <div className="p-6 max-w-2xl mx-auto fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hesap ve abonelik bilgilerin.</p>
      </div>

      {/* Account card */}
      <Card className="p-6">
        <SectionLabel icon={<User size={13} />} label="Hesap" />
        <Separator className="my-4" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {(me.name ?? me.email)?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{me.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{me.email}</p>
            </div>
          </div>
          <span
            className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold"
            style={{ background: plan.bg, color: plan.color }}
          >
            {plan.label}
          </span>
        </div>
      </Card>

      {/* Quota card */}
      <Card className="p-6">
        <SectionLabel icon={<Activity size={13} />} label="Kullanım Kotası" />
        <Separator className="my-4" />

        <div className="space-y-5">
          {/* AI Analiz */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Analiz</span>
              <span className={`font-medium ${quotaNear ? "text-warning" : ""}`}>
                {me.queries_used} / {me.queries_limit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${quotaPct}%`,
                  background:
                    quotaPct >= 90
                      ? "hsl(var(--destructive))"
                      : quotaPct >= 70
                      ? "hsl(var(--warning))"
                      : "hsl(var(--primary))",
                }}
              />
            </div>
            {quotaNear && (
              <p className="text-xs text-warning">
                Kotanın %{Math.round(quotaPct)}&apos;ini kullandın. Daha fazlası için Pro&apos;ya geç.
              </p>
            )}
          </div>

          {/* Ürün takip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Takip Edilen Ürün</span>
              <span className="font-medium">
                {me.product_count} / {me.product_limit === -1 ? "∞" : me.product_limit}
              </span>
            </div>
            {me.product_limit !== -1 && (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all"
                  style={{
                    width: `${Math.min((me.product_count / me.product_limit) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Subscription card */}
      <Card className="p-6">
        <SectionLabel icon={<CreditCard size={13} />} label="Abonelik" />
        <Separator className="my-4" />

        {me.plan === "free" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pro&apos;ya geçerek aylık 100 analiz, RAG yorum sorgusu ve LangGraph karar
              agent&apos;ına erişebilirsin.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <PlanCard
                name="Pro"
                price="₺199"
                features={["100 analiz/ay", "RAG yorum sorgusu", "Karar agent'ı"]}
                color="hsl(221 83% 53%)"
              />
              <PlanCard
                name="Business"
                price="₺799"
                features={["Sınırsız analiz", "API erişimi", "Öncelikli destek"]}
                color="hsl(262 83% 58%)"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium">{plan.label} Plan</p>
                <Badge variant="outline" className="text-[10px]">Aktif</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Plan değişikliği veya iptal için Lemon Squeezy portalına git.
              </p>
            </div>
            <button
              onClick={handlePortal}
              disabled={isPortalPending}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
            >
              {isPortalPending ? (
                <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <ExternalLink size={13} />
              )}
              Aboneliği Yönet
            </button>
          </div>
        )}
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-destructive/20">
        <SectionLabel icon={<Zap size={13} />} label="Tehlikeli Alan" />
        <Separator className="my-4" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Hesabı Sil</p>
            <p className="text-xs text-muted-foreground">
              Tüm veriler kalıcı olarak silinir. Bu işlem geri alınamaz.
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors">
            Hesabı Sil
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  color,
}: {
  name: string;
  price: string;
  features: string[];
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: `${color}33` }}
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color }}>
          {name}
        </div>
        <div className="text-xl font-semibold">
          {price}
          <span className="text-xs font-normal text-muted-foreground">/ay</span>
        </div>
      </div>
      <ul className="space-y-1">
        {features.map((f) => (
          <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
            {f}
          </li>
        ))}
      </ul>
      <button
        className="w-full h-8 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors"
        style={{ background: `${color}1A`, color }}
      >
        Geç
        <ArrowRight size={11} />
      </button>
    </div>
  );
}
