"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSubmitProduct } from "@/hooks/use-products";

const schema = z.object({
  url: z
    .string()
    .min(1, "URL gerekli")
    .url("Geçerli bir URL girin")
    .refine(
      (v) => /trendyol\.com|hepsiburada\.com/.test(v),
      "Sadece Trendyol veya Hepsiburada URL'si kabul edilir"
    ),
});

type FormValues = z.infer<typeof schema>;

export function UrlForm() {
  const router = useRouter();
  const { mutate, isPending } = useSubmitProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormValues) {
    mutate(values.url, {
      onSuccess: (data) => {
        reset();
        router.push(`/products/${data.id}`);
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-3 max-w-xl mx-auto">
        <input
          type="text"
          {...register("url")}
          placeholder="Trendyol veya Hepsiburada URL'si yapıştırın..."
          disabled={isPending}
          className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ekleniyor...
            </>
          ) : (
            "Takip Et"
          )}
        </button>
      </div>
      {errors.url && (
        <p className="text-red-400 text-sm text-center">{errors.url.message}</p>
      )}
    </form>
  );
}
