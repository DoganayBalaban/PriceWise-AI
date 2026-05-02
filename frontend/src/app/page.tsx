import { UrlForm } from "@/components/url-form";
import { TrackedProducts } from "@/components/tracked-products";

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

          <UrlForm />

          <TrackedProducts />

          <div className="mt-20 grid grid-cols-3 gap-8 text-left">
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
    title: "Price Drop Alerts",
    description:
      "Get notified the moment a product hits your target price across any retailer.",
  },
  {
    icon: "🤖",
    title: "AI Predictions",
    description:
      "Our model analyzes historical data to predict the best time to buy.",
  },
  {
    icon: "🔍",
    title: "Multi-retailer",
    description:
      "Compare prices across hundreds of stores simultaneously in real time.",
  },
];
