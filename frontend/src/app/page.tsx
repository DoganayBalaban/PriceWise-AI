import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            AI-Powered Price Tracking
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Track prices smarter with{" "}
            <span className="text-blue-400">PriceWise AI</span>
          </h1>

          <p className="text-xl text-slate-400 mb-12">
            Paste any product URL and let our AI track price drops, predict
            trends, and alert you at the perfect moment to buy.
          </p>

          <div className="flex items-center justify-center gap-4 mb-20">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 transition-colors px-8 py-3 rounded-lg font-semibold text-white"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="/login"
              className="bg-slate-700/50 hover:bg-slate-700 transition-colors px-8 py-3 rounded-lg font-semibold text-white border border-slate-600"
            >
              Giriş Yap
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 text-left">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-slate-700/30 border border-slate-700 rounded-xl p-6"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    icon: "📉",
    title: "Fiyat Düşüş Alarmları",
    description:
      "Ürün hedef fiyatına ulaştığı anda anında bildirim al.",
  },
  {
    icon: "🤖",
    title: "AI Tahminleri",
    description:
      "Geçmiş verileri analiz ederek en iyi alım zamanını tahmin eder.",
  },
  {
    icon: "🔍",
    title: "Çoklu Platform",
    description:
      "Trendyol ve Hepsiburada fiyatlarını tek yerden karşılaştır.",
  },
];
