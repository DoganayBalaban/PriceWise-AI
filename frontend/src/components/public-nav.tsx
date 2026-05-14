import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/wave-w-logo";

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">Özellikler</a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</a>
          <Link href="/docs" className="hover:text-foreground transition-colors">Dokümantasyon</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Giriş
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ücretsiz Başla
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
