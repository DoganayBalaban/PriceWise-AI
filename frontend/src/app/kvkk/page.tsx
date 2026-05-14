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

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Yasal</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">KVKK Aydınlatma Metni</h1>
        <p className="text-xs text-muted-foreground mb-12">
          6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır. Son güncelleme: 14 Mayıs 2026
        </p>

        <Section title="1. Veri Sorumlusu">
          <p>
            PriceWise AI veri sorumlusu sıfatıyla kişisel verilerinizi 6698 sayılı Kanun&apos;a uygun biçimde işlemektedir.
            İletişim: <a href="mailto:hello@pricewise.ai" className="text-primary hover:underline">hello@pricewise.ai</a>
          </p>
        </Section>

        <Section title="2. İşlenen Kişisel Veriler">
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Kimlik ve İletişim:</strong> Ad-soyad (opsiyonel), e-posta adresi</li>
            <li><strong>İşlem Güvenliği:</strong> IP adresi, oturum token&apos;ları, log kayıtları</li>
            <li><strong>Müşteri İşlem:</strong> Ödeme geçmişi, plan bilgisi, analiz kayıtları</li>
            <li><strong>Kullanım Verisi:</strong> Analiz edilen URL&apos;ler, sorgu geçmişi</li>
          </ul>
        </Section>

        <Section title="3. İşleme Amaçları ve Hukuki Dayanakları">
          <ul className="list-disc pl-4 space-y-1">
            <li>Sözleşmenin ifası — hizmet sunumu, hesap yönetimi (m. 5/2-c)</li>
            <li>Meşru menfaat — güvenlik logları, dolandırıcılık önleme (m. 5/2-f)</li>
            <li>Açık rıza — isteğe bağlı analitik çerezler (m. 5/1)</li>
            <li>Yasal yükümlülük — vergi, muhasebe kayıtları (m. 5/2-ç)</li>
          </ul>
        </Section>

        <Section title="4. Verilerin Aktarımı">
          <p>
            Kişisel verileriniz yurt içinde; Lemon Squeezy (ödeme aracısı), Neon (veritabanı),
            Resend (e-posta) ile teknik hizmet sağlayıcılara aktarılır. Yurt dışı aktarım söz konusu
            olduğunda KVKK m. 9 kapsamındaki güvenceler sağlanır.
          </p>
        </Section>

        <Section title="5. Saklama Süresi">
          <p>
            Kişisel veriler, sözleşme süresince ve sözleşme bitiminden itibaren 3 yıl saklanır.
            Yasal yükümlülük gerektiren veriler (fatura, ödeme kayıtları) 10 yıl saklanır.
            Süre dolduğunda veriler imha edilir.
          </p>
        </Section>

        <Section title="6. Haklarınız (KVKK m. 11)">
          <ul className="list-disc pl-4 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen veriler hakkında bilgi talep etme</li>
            <li>Verilerin düzeltilmesini veya silinmesini isteme</li>
            <li>İşlemenin kısıtlanmasını talep etme</li>
            <li>Veri taşınabilirliği</li>
            <li>Otomatik karar alma süreçlerine itiraz</li>
          </ul>
        </Section>

        <Section title="7. Başvuru Yöntemi">
          <p>
            Haklarınızı kullanmak için{" "}
            <a href="mailto:hello@pricewise.ai" className="text-primary hover:underline">hello@pricewise.ai</a>{" "}
            adresine kimliğinizi doğrulayan bir e-posta gönderebilirsiniz.
            Başvurular 30 gün içinde sonuçlandırılır. Herhangi bir ücret talep edilmez.
            Başvurunuzun yanıtsız kalması durumunda Kişisel Verileri Koruma Kurulu&apos;na şikâyette bulunabilirsiniz.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
          <Link href="/privacy" className="hover:text-foreground">Gizlilik Politikası →</Link>
        </div>
      </div>
    </div>
  );
}
