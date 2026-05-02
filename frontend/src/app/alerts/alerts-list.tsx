"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAlerts, useDeleteAlert, useUpdateAlert, useTestAlert } from "@/hooks/use-alerts";
import type { AlertResponse } from "@/types/alert";

const STORAGE_KEY = "pw_alert_email";

const fmt = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

function AlertRow({ alert }: { alert: AlertResponse }) {
  const { mutate: deleteAlert, isPending: isDeleting } = useDeleteAlert();
  const { mutate: updateAlert, isPending: isUpdating } = useUpdateAlert();
  const { mutate: testAlert, isPending: isTesting } = useTestAlert();

  function handleToggle() {
    updateAlert(
      { id: alert.id, data: { active: !alert.active } },
      {
        onSuccess: () => toast.success(alert.active ? "Alarm devre dışı bırakıldı" : "Alarm aktifleştirildi"),
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
      onSuccess: (data) => toast.success(`Test maili gönderildi: ${data.to}`),
      onError: (err: Error) => toast.error(err.message),
    });
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.active ? "bg-emerald-400" : "bg-slate-500"}`}
        />
        <div className="min-w-0">
          <p className="text-xs text-slate-400 truncate">Ürün ID: {alert.product_id}</p>
          <p className="text-sm font-medium text-white">
            Hedef: {fmt.format(alert.target_price)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/products/${alert.product_id}`}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          Ürüne Git
        </Link>
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
        >
          {isTesting ? "Gönderiliyor..." : "Test Maili"}
        </button>
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            alert.active
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          {alert.active ? "Devre Dışı" : "Aktifleştir"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
        >
          Sil
        </button>
      </div>
    </div>
  );
}

export function AlertsList() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setEmail(saved);
  }, []);

  const { data: alerts, isLoading } = useAlerts(email);

  if (!email) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-2">Alarmlarını görmek için</p>
        <p className="text-slate-500 text-sm">
          Önce bir ürün sayfasından alarm kur — e-posta otomatik kaydedilir.
        </p>
        <Link href="/" className="mt-6 inline-block text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Ana sayfaya dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fiyat Alarmlarım</h1>
          <p className="text-sm text-slate-400 mt-1">{email}</p>
        </div>
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Ana sayfa
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && alerts?.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Henüz alarm kurulmamış.
        </div>
      )}

      {!isLoading && alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
