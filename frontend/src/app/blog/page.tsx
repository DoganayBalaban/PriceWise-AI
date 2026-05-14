import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const POSTS = [
  {
    slug: "#",
    date: "14 Mayıs 2026",
    tag: "Duyuru",
    title: "PriceWise AI beta'ya açıldı",
    excerpt:
      "12 aylık geliştirme sürecinin ardından PriceWise AI kamuya açık beta dönemine girdi. İlk 500 kullanıcı Pro planını ücretsiz kullanabilir.",
  },
  {
    slug: "#",
    date: "2 Mayıs 2026",
    tag: "Teknik",
    title: "BERT-TR + LoRA ile Türkçe sentiment modeli nasıl eğittik",
    excerpt:
      "dbmdz/bert-base-turkish-cased modelini 47.000 Türkçe e-ticaret yorumuyla fine-tune ettik. F1 skoru 0.84'e ulaştı, inference süresi 180ms altında kaldı.",
  },
  {
    slug: "#",
    date: "18 Nisan 2026",
    tag: "Ürün",
    title: "LangGraph karar agent'ının mimarisi",
    excerpt:
      "Router → Price Analyst → Review RAG → Decision node pipeline'ının nasıl çalıştığını ve neden LangGraph'ı seçtiğimizi anlattık.",
  },
  {
    slug: "#",
    date: "5 Mart 2026",
    tag: "Teknik",
    title: "Pinecone + LangChain RAG pipeline'ı: Türkçe yorumlar üzerinde soru-cevap",
    excerpt:
      "256 token chunk boyutu, overlap 32 ve text-embedding-3-small ile inşa ettiğimiz RAG pipeline'ında RAGAS faithfulness 0.78 çıktı.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Blog</Badge>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Yazılar</h1>
        <p className="text-muted-foreground mb-12">
          Geliştirme sürecindeki teknik kararlar, ürün güncellemeleri ve duyurular.
        </p>

        <div className="space-y-4">
          {POSTS.map((post) => (
            <Card key={post.title} className="p-6 hover:border-primary/40 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="text-[10px]">{post.tag}</Badge>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <h2 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
              <Link href={post.slug} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Devamını oku <ArrowRight size={12} />
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
        </div>
      </div>
    </div>
  );
}
