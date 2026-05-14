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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Yasal</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Kullanım Koşulları</h1>
        <p className="text-xs text-muted-foreground mb-12">Son güncelleme: 14 Mayıs 2026</p>

        <Section title="1. Hizmet">
          <p>
            PriceWise AI, e-ticaret fiyat analizi ve yapay zeka destekli alım kararı hizmeti sunar.
            Bu koşulları kabul ederek platforma kaydolur ve hizmetleri kullanırsınız.
          </p>
        </Section>

        <Section title="2. Hesap ve Güvenlik">
          <p>
            Hesabınızın güvenliğinden siz sorumlusunuz. Şüpheli aktivite tespit ederseniz derhal
            bildirin. Başkasına ait hesap bilgilerini kullanmak yasaktır.
          </p>
        </Section>

        <Section title="3. Kabul Edilemez Kullanım">
          <p>Aşağıdaki kullanımlar kesinlikle yasaktır:</p>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>API&apos;yi otomatik botlarla aşırı yükleme</li>
            <li>Elde edilen verileri yeniden satma veya dağıtma</li>
            <li>Güvenlik açıklarını test etme veya istismar etme</li>
            <li>Başka kullanıcıların hesaplarına izinsiz erişim</li>
          </ul>
        </Section>

        <Section title="4. Abonelik ve Ödeme">
          <p>
            Pro ve Business planları aylık dönemli olarak Lemon Squeezy aracılığıyla tahsil edilir.
            İptal işlemi dönem sonuna kadar geçerli olmaz ve kısmi iade yapılmaz.
            Fiyat değişiklikleri 30 gün önceden bildirilir.
          </p>
        </Section>

        <Section title="5. Hizmet Sürekliliği">
          <p>
            Makul düzeyde %99+ uptime hedeflenmektedir ancak garantili değildir.
            Planlı bakımlar önceden duyurulur. Teknik arızadan kaynaklanan kesintilerde
            hesabınıza kredi tanınabilir.
          </p>
        </Section>

        <Section title="6. Fikri Mülkiyet">
          <p>
            PriceWise AI platformu, logosu, modelleri ve kaynak kodu üzerindeki tüm haklar
            saklıdır. API çıktılarını kendi ürününüzde kullanabilirsiniz; ancak platformu
            kopyalayamazsınız.
          </p>
        </Section>

        <Section title="7. Sorumluluk Sınırı">
          <p>
            PriceWise AI, fiyat tahminlerinin doğruluğunu garanti etmez. Alım kararları
            yatırım tavsiyesi niteliği taşımaz. Oluşabilecek finansal kayıplardan platform
            sorumlu tutulamaz.
          </p>
        </Section>

        <Section title="8. İletişim">
          <p>
            Bu koşullarla ilgili sorularınız için:{" "}
            <a href="mailto:hello@pricewise.ai" className="text-primary hover:underline">hello@pricewise.ai</a>
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
