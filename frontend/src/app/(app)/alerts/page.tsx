import { AlertsList } from "./alerts-list";

export default function AlertsPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <AlertsList />
      </div>
    </main>
  );
}
