"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateAlert } from "@/hooks/use-alerts";

const schema = z.object({
  target_price: z.number({ error: "Geçerli bir fiyat girin" }).positive("Geçerli bir fiyat girin"),
});

type FormValues = z.infer<typeof schema>;

interface AlertButtonProps {
  productId: string;
  currentPrice: number;
}

export function AlertButton({ productId, currentPrice }: AlertButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createAlert, isPending } = useCreateAlert();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { target_price: Math.floor(currentPrice * 0.9) },
  });

  function onSubmit(values: FormValues) {
    createAlert(
      { product_id: productId, target_price: values.target_price },
      {
        onSuccess: () => {
          toast.success("Alarm kuruldu! Fiyat düşünce e-posta alacaksın.");
          reset();
          setOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        Alarm Kur
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Fiyat Alarmı Kur</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Hedef Fiyat (₺)
                </label>
                <input
                  {...register("target_price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.target_price && (
                  <p className="text-red-400 text-xs mt-1">{errors.target_price.message}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Şu anki fiyat: ₺{currentPrice.toLocaleString("tr-TR")}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Alarm Kur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
