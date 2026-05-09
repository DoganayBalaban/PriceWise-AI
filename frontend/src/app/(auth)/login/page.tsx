"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit({ email, password }: FormValues) {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      toast.error(error.message ?? "Giriş başarısız");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <AuthShell title="Tekrar hoş geldin" subtitle="Hesabına giriş yap ve analizlere devam et.">
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-10 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center gap-3 text-sm font-medium transition-colors mb-3"
      >
        <GoogleIcon />
        Google ile devam et
      </button>

      <Divider label="veya e-posta ile" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Field label="E-posta" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="sen@firma.com"
            autoComplete="email"
            className={cn(inputCls, errors.email && errorInputCls)}
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium">Şifre</label>
            <a href="#" className="text-xs text-primary hover:underline">
              Unuttun mu?
            </a>
          </div>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(inputCls, errors.password && errorInputCls)}
          />
          {errors.password && (
            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground py-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded" />
          Beni hatırla
        </label>

        <SubmitButton loading={isSubmitting}>
          Giriş yap
          <ArrowRight size={14} />
        </SubmitButton>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-6">
        Hesabın yok mu?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Ücretsiz kayıt ol
        </Link>
      </p>
    </AuthShell>
  );
}

/* ── Shared shell ─────────────────────────────────────────── */

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={14} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">PriceWise AI</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>
          {children}
        </div>
      </div>

      {/* Right: gradient panel */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-md text-white px-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs mb-6 backdrop-blur">
            <Sparkles size={12} />
            AI destekli alışveriş
          </div>
          <h2
            className="text-4xl font-semibold tracking-tight mb-4"
            style={{ lineHeight: 1.15 }}
          >
            Türkiye&apos;nin en akıllı fiyat asistanı.
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-10">
            Trendyol, Hepsiburada ve n11&apos;de saatlerce sürebilen karşılaştırmayı
            saniyeler içinde, AI destekli karar önerisiyle yap.
          </p>
          <div className="space-y-3">
            {[
              "Fiyat geçmişi & 30 gün tahmin",
              "Yorumlara doğal dilde soru sor",
              "Multi-platform anlık karşılaştırma",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check size={12} />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Micro components ─────────────────────────────────────── */

const inputCls =
  "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

const errorInputCls = "border-destructive focus:ring-destructive/50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
      )}
      {children}
    </button>
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
