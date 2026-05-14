import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const FAQS = [
  {
    q: "Hangi platformlar destekleniyor?",
    a: "Şu an Trendyol, Hepsiburada ve n11 desteklenmektedir. Yakında Amazon Türkiye ve Çiçeksepeti eklenecek.",
  },
  {
    q: "Fiyat tahmini ne kadar doğru?",
    a: "Prophet zaman serisi modelimiz, 30 günlük geçmiş veriyle 7 günlük tahmin üretir. Ortalama MAE (mutlak hata oranı) %6-9 arasındadır. Hızlı fiyat değişimlerinde sapma olabilir.",
  },
  {
    q: "Ücretsiz planda kaç analiz hakkım var?",
    a: "Ücretsiz planda ayda 5 analiz hakkı bulunur. Ay başında sıfırlanır.",
  },
  {
    q: "API anahtarı nasıl alırım?",
    a: "Business planına geçtikten sonra Dashboard → Ayarlar → API Anahtarları bölümünden yeni anahtar üretebilirsiniz.",
  },
  {
    q: "Fiyat alarmı nasıl kurarım?",
    a: "Ürün analiz sayfasında 'Alarm Kur' butonuna tıklayın, hedef fiyatınızı girin. Fiyat bu eşiğin altına düştüğünde e-posta alırsınız.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Tüm veriler Türkiye merkezli sunucularda tutulur, üçüncü taraflarla paylaşılmaz. Detaylar için Gizlilik Politikası'nı inceleyin.",
  },
  {
    q: "Plan yükseltme / düşürme nasıl yapılır?",
    a: "Dashboard → Ayarlar → Plan bölümünden anlık olarak değiştirilebilir. Yükseltmeler hemen aktif olur, düşürmeler dönem sonunda geçerli olur.",
  },
  {
    q: "İptal politikası nedir?",
    a: "İstediğiniz an iptal edebilirsiniz. Ödediğiniz dönem sonuna kadar hizmet devam eder, para iadesi yapılmaz.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Yardım Merkezi</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Sık Sorulan Sorular</h1>
        <p className="text-muted-foreground mb-12">
          Cevabınızı bulamadıysanız{" "}
          <a href="mailto:hello@pricewise.ai" className="text-primary hover:underline">
            hello@pricewise.ai
          </a>{" "}
          adresine yazabilirsiniz.
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <Card key={i} className="p-5">
              <div className="font-medium text-sm mb-2">{faq.q}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl border border-border bg-muted/30 text-center">
          <div className="font-medium mb-1">Hâlâ sorunuz mu var?</div>
          <p className="text-sm text-muted-foreground mb-4">Destek ekibimiz genellikle 24 saat içinde yanıt verir.</p>
          <a
            href="mailto:hello@pricewise.ai"
            className="inline-flex items-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Bize Yazın
          </a>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
        </div>
      </div>
    </div>
  );
}
