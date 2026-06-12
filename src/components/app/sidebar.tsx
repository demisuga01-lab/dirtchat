"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/providers", label: "Providers", icon: KeyRound },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden w-60 shrink-0 border-r border-border/60 bg-background/40 md:flex md:flex-col"
      aria-label="Primary navigation"
    >
      <div className="flex h-14 items-center gap-2 border-b border-border/60 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          D
        </div>
        <span className="text-sm font-semibold">Dirtchat</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/60 p-3 text-xs text-muted-foreground">
        <div className="rounded-md border border-dashed border-border/60 p-3">
          <div className="font-medium text-foreground">Dirtchat</div>
          <p className="mt-1 leading-relaxed">
            All features are active.
          </p>
        </div>
      </div>
    </aside>
  );
}
