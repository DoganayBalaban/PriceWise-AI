"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  Box,
  Code,
  CreditCard,
  History,
  Layout,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Ana",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Layout },
      { href: "/products", label: "Ürünlerim", icon: Box },
      { href: "/products/add", label: "Ürün Ekle", icon: Plus },
      { href: "/alerts", label: "Alarmlar", icon: Bell },
      { href: "/history", label: "Geçmiş", icon: History },
    ],
  },
  {
    label: "Hesap",
    items: [
      { href: "/pricing", label: "Pricing", icon: CreditCard },
      { href: "/developer", label: "Developer API", icon: Code },
      { href: "/settings", label: "Ayarlar", icon: Settings },
    ],
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
        <Zap size={14} className="text-primary-foreground" />
      </div>
      <span className="font-semibold text-sm tracking-tight">PriceWise AI</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/products"
                  ? pathname === "/products" ||
                    (pathname.startsWith("/products/") && !pathname.startsWith("/products/add"))
                  : item.href === "/dashboard" || item.href === "/products/add"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
            D
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Doğanay</div>
            <div className="text-xs text-muted-foreground truncate">
              Free Plan
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
