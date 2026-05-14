import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const COOKIE_TYPES = [
  {
    name: "Zorunlu Çerezler",
    purpose: "Oturum yönetimi, kimlik doğrulama",
    duration: "Oturum süresi",
    canDisable: false,
    examples: "next-auth.session-token, pw_session",
  },
  {
    name: "İşlevsel Çerezler",
    purpose: "Dil, tema ve kullanıcı tercihleri",
    duration: "1 yıl",
    canDisable: true,
    examples: "pw_theme, pw_lang",
  },
  {
    name: "Analitik Çerezler",
    purpose: "Anonim kullanım istatistikleri (Plausible)",
    duration: "1 yıl",
    canDisable: true,
    examples: "plausible_ignore",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Yasal</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Çerez Politikası</h1>
        <p className="text-xs text-muted-foreground mb-12">Son güncelleme: 14 Mayıs 2026</p>

        <div className="text-sm text-muted-foreground leading-relaxed mb-8">
          <p>
            PriceWise AI, platformun çalışması ve kullanıcı deneyiminin iyileştirilmesi için
            çerezler kullanır. Bu sayfa hangi çerezlerin kullanıldığını ve nasıl kontrol
            edebileceğinizi açıklar.
          </p>
        </div>

        <h2 className="text-lg font-semibold mb-4">Çerez Türleri</h2>
        <div className="space-y-4 mb-10">
          {COOKIE_TYPES.map((ct) => (
            <Card key={ct.name} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="font-medium text-sm">{ct.name}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${ct.canDisable ? "text-muted-foreground" : "bg-primary/10 text-primary border-primary/20"}`}
                >
                  {ct.canDisable ? "Devre dışı bırakılabilir" : "Zorunlu"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="text-foreground font-medium">Amaç:</span> {ct.purpose}</div>
                <div><span className="text-foreground font-medium">Süre:</span> {ct.duration}</div>
                <div className="col-span-2"><span className="text-foreground font-medium">Örnekler:</span> <code className="bg-muted px-1 rounded">{ct.examples}</code></div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed space-y-4 mb-10">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Çerezleri Nasıl Kontrol Edersiniz?</h2>
            <p>
              Tarayıcı ayarlarından tüm çerezleri engelleyebilir veya mevcut çerezleri silebilirsiniz.
              Ancak zorunlu çerezlerin devre dışı bırakılması oturum açma gibi temel işlevleri
              etkileyebilir.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Üçüncü Taraf Çerezleri</h2>
            <p>
              Analitik için Plausible Analytics kullanılır. Plausible, çerez kullanmadan IP
              adresini anonimleştirir. Google Analytics veya Meta Pixel kullanılmaz.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
          <Link href="/privacy" className="hover:text-foreground">Gizlilik Politikası →</Link>
        </div>
      </div>
    </div>
  );
}
