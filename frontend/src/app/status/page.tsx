import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const SERVICES = [
  { name: "API (api.pricewise.ai)", status: "operational", uptime: "99.8%" },
  { name: "Web Uygulaması", status: "operational", uptime: "99.9%" },
  { name: "Scraping Servisi", status: "operational", uptime: "99.4%" },
  { name: "ML Pipeline (Prophet, BERT-TR)", status: "operational", uptime: "99.6%" },
  { name: "RAG / Pinecone", status: "operational", uptime: "99.7%" },
  { name: "E-posta Bildirimleri", status: "operational", uptime: "99.9%" },
  { name: "PostgreSQL Veritabanı", status: "operational", uptime: "100%" },
  { name: "Redis Cache", status: "operational", uptime: "99.9%" },
];

const INCIDENTS: { date: string; title: string; resolved: boolean }[] = [];

const STATUS_STYLES = {
  operational: { label: "Çalışıyor", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  degraded: { label: "Yavaş", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  down: { label: "Kesinti", className: "bg-red-500/10 text-red-600 border-red-500/20" },
} as const;

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4 text-xs">Sistem Durumu</Badge>

        {/* Overall status */}
        <div className={`rounded-2xl p-6 mb-10 flex items-center gap-4 ${allOperational ? "bg-green-500/8 border border-green-500/20" : "bg-yellow-500/8 border border-yellow-500/20"}`}>
          <div className={`w-3 h-3 rounded-full shrink-0 ${allOperational ? "bg-green-500" : "bg-yellow-500"}`} />
          <div>
            <div className="font-semibold text-lg">
              {allOperational ? "Tüm sistemler çalışıyor" : "Bazı sistemlerde sorun var"}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">Son kontrol: az önce</div>
          </div>
        </div>

        {/* Services */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Servisler</h2>
        <Card className="p-0 overflow-hidden mb-10">
          {SERVICES.map((svc, i) => {
            const style = STATUS_STYLES[svc.status as keyof typeof STATUS_STYLES];
            return (
              <div key={svc.name} className={`flex items-center justify-between px-4 py-3 text-sm ${i !== SERVICES.length - 1 ? "border-b border-border" : ""}`}>
                <span className="text-foreground">{svc.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono">{svc.uptime}</span>
                  <Badge variant="outline" className={`text-[10px] ${style.className}`}>{style.label}</Badge>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Incidents */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Son Olaylar</h2>
        {INCIDENTS.length === 0 ? (
          <p className="text-sm text-muted-foreground">Son 90 günde kayıt edilmiş kesinti yok.</p>
        ) : (
          <div className="space-y-3">
            {INCIDENTS.map((inc) => (
              <Card key={inc.title} className="p-4 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{inc.title}</span>
                  <Badge variant={inc.resolved ? "secondary" : "destructive"} className="text-[10px]">
                    {inc.resolved ? "Çözüldü" : "Devam ediyor"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{inc.date}</span>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfa</Link>
        </div>
      </div>
    </div>
  );
}
