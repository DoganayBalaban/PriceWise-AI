"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Link2, Sparkles } from "lucide-react";
import { useSubmitProduct } from "@/hooks/use-products";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Card } from "@/components/ui/card";

const schema = z.object({
  url: z
    .string()
    .min(1, "URL gerekli")
    .url("Geçerli bir URL girin")
    .refine(
      (v) => /trendyol\.com|hepsiburada\.com|n11\.com/.test(v),
      "Sadece Trendyol, Hepsiburada veya n11 URL'si kabul edilir"
    ),
});

type FormValues = z.infer<typeof schema>;

const EXAMPLES = [
  { label: "trendyol.com/samsung-buds2-pro", url: "https://www.trendyol.com/samsung/galaxy-buds2-pro" },
  { label: "hepsiburada.com/sony-wh1000xm5", url: "https://www.hepsiburada.com/sony-wh1000xm5" },
  { label: "n11.com/logitech-mx3s", url: "https://www.n11.com/logitech-mx3s" },
];

export default function ProductAddPage() {
  const router = useRouter();
  const { mutate, isPending } = useSubmitProduct();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormValues) {
    mutate(values.url, {
      onSuccess: (data) => {
        router.push(`/products/${data.id}`);
      },
      onError: (err: Error) => {
        if ((err as Error & { status?: number }).status === 402) {
          setShowUpgrade(true);
        } else {
          toast.error(err.message);
        }
      },
    });
  }

  return (
    <>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <div className="p-6 max-w-2xl mx-auto fade-in space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard&apos;a dön
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Yeni ürün ekle</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trendyol, Hepsiburada veya n11 ürün linkini yapıştır. Geçmiş veriler otomatik çekilir.
          </p>
        </div>

        {/* Form card */}
        <Card className="p-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ürün URL&apos;i</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    {...register("url")}
                    type="text"
                    placeholder="https://www.trendyol.com/..."
                    disabled={isPending}
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isPending ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  {isPending ? "Tarıyor…" : "Tara"}
                </button>
              </div>
              {errors.url && (
                <p className="text-destructive text-xs">{errors.url.message}</p>
              )}
            </div>

            {/* Example chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Örnek
              </span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setValue("url", ex.url)}
                  className="text-xs border border-border rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors font-mono"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
