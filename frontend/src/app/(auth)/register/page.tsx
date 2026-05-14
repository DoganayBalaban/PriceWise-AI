"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/app/(auth)/login/page";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .string()
  .min(8, "En az 8 karakter")
  .regex(/[A-Z]/, "En az bir büyük harf")
  .regex(/[0-9]/, "En az bir rakam")
  .regex(/[^A-Za-z0-9]/, "En az bir özel karakter");

const schema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, "Devam etmek için kabul etmelisiniz"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Şifreler eşleşmiyor",
  });

type FormValues = z.infer<typeof schema>;

const inputCls =
  "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

const errorInputCls = "border-destructive focus:ring-destructive/50";

const PASSWORD_RULES = [
  { label: "En az 8 karakter", test: (v: string) => v.length >= 8 },
  { label: "En az bir büyük harf", test: (v: string) => /[A-Z]/.test(v) },
  { label: "En az bir rakam", test: (v: string) => /[0-9]/.test(v) },
  { label: "En az bir özel karakter", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });
  const passwordTouched = passwordValue.length > 0;

  async function onSubmit({ name, email, password }: FormValues) {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      const msg =
        error.message?.includes("already exists") || error.message?.includes("already in use")
          ? "Bu e-posta adresi zaten kayıtlı"
          : error.message?.includes("password")
          ? "Şifre gereksinimleri karşılanmıyor"
          : "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      toast.error(msg);
    } else {
      toast.success("Hesabın oluşturuldu! Hoş geldin 🎉");
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <AuthShell
      title="Ücretsiz hesap oluştur"
      subtitle="Aylık 5 ücretsiz analiz ile başla. Kredi kartı gerekmez."
    >
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-10 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center gap-3 text-sm font-medium transition-colors mb-3"
      >
        <GoogleIcon />
        Google ile devam et
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">veya</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Name */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Ad Soyad</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Adın"
            autoComplete="name"
            className={cn(inputCls, errors.name && errorInputCls)}
          />
          {errors.name && (
            <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">E-posta</label>
          <input
            {...register("email")}
            type="email"
            placeholder="sen@firma.com"
            autoComplete="email"
            className={cn(inputCls, errors.email && errorInputCls)}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Şifre</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Güçlü bir şifre oluştur"
              autoComplete="new-password"
              className={cn(inputCls, "pr-10", errors.password && errorInputCls)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Password rules checklist */}
          {passwordTouched && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(passwordValue);
                return (
                  <li key={rule.label} className={cn("flex items-center gap-1.5 text-xs transition-colors", ok ? "text-green-600" : "text-muted-foreground")}>
                    {ok
                      ? <Check size={11} className="shrink-0" />
                      : <X size={11} className="shrink-0 text-muted-foreground/50" />
                    }
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
          {errors.password && !passwordTouched && (
            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Şifre Tekrar</label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Şifreni tekrar gir"
              autoComplete="new-password"
              className={cn(inputCls, "pr-10", errors.confirmPassword && errorInputCls)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-xs text-muted-foreground py-1 cursor-pointer">
          <input
            {...register("terms")}
            type="checkbox"
            className="rounded mt-0.5 shrink-0"
          />
          <span>
            <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank">
              Kullanım Şartları
            </Link>
            {" "}ve{" "}
            <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
              Gizlilik Politikası
            </Link>
            &apos;nı okudum ve kabul ediyorum.
          </span>
        </label>
        {errors.terms && (
          <p className="text-destructive text-xs -mt-1">{errors.terms.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          )}
          Hesap oluştur
          <ArrowRight size={14} />
        </button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-6">
        Hesabın var mı?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Giriş yap
        </Link>
      </p>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
