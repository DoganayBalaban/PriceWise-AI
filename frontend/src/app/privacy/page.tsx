import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Yasal</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Gizlilik Politikası</h1>
        <p className="text-xs text-muted-foreground mb-12">Son güncelleme: 14 Mayıs 2026</p>

        <Section title="1. Topladığımız Veriler">
          <p>PriceWise AI aşağıdaki verileri işler:</p>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>Hesap bilgileri: e-posta adresi, parola (hash&apos;lenmiş)</li>
            <li>Analiz ettiğiniz ürün URL&apos;leri ve sonuçları</li>
            <li>Kullanım istatistikleri (analiz sayısı, plan bilgisi)</li>
            <li>Teknik loglar: IP adresi, tarayıcı bilgisi, hata kayıtları</li>
          </ul>
        </Section>

        <Section title="2. Verileri Nasıl Kullanıyoruz">
          <p>Toplanan veriler yalnızca şu amaçlarla kullanılır:</p>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>Hizmetin sağlanması ve iyileştirilmesi</li>
            <li>Hesap yönetimi ve kimlik doğrulama</li>
            <li>Fiyat alarmları ve bildirim gönderimi</li>
            <li>Teknik sorunların teşhis edilmesi</li>
          </ul>
        </Section>

        <Section title="3. Veri Paylaşımı">
          <p>
            Kişisel verileriniz hiçbir üçüncü tarafla satılmaz veya kiralanmaz.
            Hizmet sağlayıcılarımız (Neon PostgreSQL, Upstash Redis, Resend, Lemon Squeezy)
            yalnızca hizmetin işletilmesi için gerekli verilere erişir ve gizlilik anlaşmalarına tabidir.
          </p>
        </Section>

        <Section title="4. Veri Güvenliği">
          <p>
            Tüm veriler aktarım sırasında TLS ile şifrelenir. Parolalar bcrypt algoritmasıyla hashlenir.
            API anahtarları SHA-256 hash&apos;i olarak saklanır. Düzenli güvenlik denetimleri yapılır.
          </p>
        </Section>

        <Section title="5. Çerezler">
          <p>
            Oturum yönetimi için zorunlu çerezler kullanılır. İsteğe bağlı analitik çerezler için
            ayrı onayınız alınır. Detaylar için{" "}
            <Link href="/cookies" className="text-primary hover:underline">Çerez Politikası</Link>&apos;nı inceleyin.
          </p>
        </Section>

        <Section title="6. Haklarınız (KVKK)">
          <p>
            6698 sayılı KVKK kapsamında kişisel verilerinize erişme, düzeltme, silme ve taşıma haklarına sahipsiniz.
            Talepler için{" "}
            <a href="mailto:hello@pricewise.ai" className="text-primary hover:underline">hello@pricewise.ai</a>{" "}
            adresine yazabilirsiniz. 30 gün içinde yanıt verilir.
          </p>
        </Section>

        <Section title="7. Değişiklikler">
          <p>
            Bu politika önceden bildirim yapılarak güncellenebilir. Önemli değişikliklerde
            kayıtlı e-posta adresinize bildirim gönderilir.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
          <Link href="/kvkk" className="hover:text-foreground">KVKK →</Link>
        </div>
      </div>
    </div>
  );
}
