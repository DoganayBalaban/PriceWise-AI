"use client";

import Link from "next/link";
import { Bell, BellOff, ChevronRight, ExternalLink, FlaskConical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAlerts, useDeleteAlert, useUpdateAlert, useTestAlert } from "@/hooks/use-alerts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertResponse } from "@/types/alert";

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function AlertsList() {
  const { data: alerts, isLoading } = useAlerts();

  const active = alerts?.filter((a) => a.active) ?? [];
  const inactive = alerts?.filter((a) => !a.active) ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alarmlarım</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hedef fiyat altına düşünce e-posta ile bildirim alırsın.
          </p>
        </div>
        {!isLoading && alerts && alerts.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {active.length} aktif
            </Badge>
            {inactive.length > 0 && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                {inactive.length} pasif
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-7 w-28" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!alerts || alerts.length === 0) && (
        <Card className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Bell size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">Henüz alarm yok</p>
          <p className="text-xs text-muted-foreground mb-4">
            Ürün sayfasında &quot;Alarm Kur&quot; butonuna tıklayarak hedef fiyat belirle.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            Ürünlere git
            <ChevronRight size={12} />
          </Link>
        </Card>
      )}

      {/* Active alerts */}
      {!isLoading && active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aktif
          </h2>
          {active.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </section>
      )}

      {/* Inactive alerts */}
      {!isLoading && inactive.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pasif
          </h2>
          {inactive.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </section>
      )}
    </div>
  );
}

function AlertRow({ alert }: { alert: AlertResponse }) {
  const { mutate: deleteAlert, isPending: isDeleting } = useDeleteAlert();
  const { mutate: updateAlert, isPending: isUpdating } = useUpdateAlert();
  const { mutate: testAlert, isPending: isTesting } = useTestAlert();

  function handleToggle() {
    updateAlert(
      { id: alert.id, data: { active: !alert.active } },
      {
        onSuccess: () =>
          toast.success(alert.active ? "Alarm devre dışı bırakıldı" : "Alarm aktifleştirildi"),
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  function handleDelete() {
    deleteAlert(alert.id, {
      onSuccess: () => toast.success("Alarm silindi"),
      onError: (err: Error) => toast.error(err.message),
    });
  }

  function handleTest() {
    testAlert(alert.id, {
      onSuccess: (data) => toast.success(`Test maili gönderildi: ${(data as { to: string }).to}`),
      onError: (err: Error) => toast.error(err.message),
    });
  }

  return (
    <Card className="p-4 flex items-center gap-4 flex-wrap group">
      {/* Status icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          alert.active
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {alert.active ? <Bell size={16} /> : <BellOff size={16} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold">{fmt.format(alert.target_price)}</span>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              alert.active
                ? "border-success/30 text-success"
                : "border-border text-muted-foreground"
            }`}
          >
            {alert.active ? "Aktif" : "Pasif"}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {alert.email} · Oluşturuldu{" "}
          {new Date(alert.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          href={`/products/${alert.product_id}`}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink size={11} />
          Ürün
        </Link>

        <button
          onClick={handleTest}
          disabled={isTesting}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {isTesting ? (
            <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <FlaskConical size={11} />
          )}
          Test
        </button>

        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
            alert.active
              ? "bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20"
              : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {isUpdating ? (
            <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
          ) : alert.active ? (
            "Devre dışı"
          ) : (
            "Aktifleştir"
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
          title="Sil"
        >
          {isDeleting ? (
            <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
        </button>
      </div>
    </Card>
  );
}
