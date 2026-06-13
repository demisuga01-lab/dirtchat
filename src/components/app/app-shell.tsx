"use client";

import * as React from "react";
import { WorkspaceSidebar } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export interface AppShellProps {
  title: string;
  userLabel?: string;
  userEmail?: string;
  initialSidebarCollapsed?: boolean;
  children: React.ReactNode;
}

import { PanelLeftClose, PanelLeft } from "lucide-react";

export function AppShell({
  title,
  userLabel,
  userEmail,
  initialSidebarCollapsed = false,
  children,
}: AppShellProps) {
  const [navOpen, setNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(initialSidebarCollapsed);

  React.useEffect(() => {
    setSidebarCollapsed(initialSidebarCollapsed);
  }, [initialSidebarCollapsed]);

  const toggleSidebar = async () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    try {
      await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sidebar_collapsed: nextState }),
      });
    } catch {
      // Fail silent
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-foreground">
      <WorkspaceSidebar
        userEmail={userEmail}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-foreground hover:bg-secondary"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {userLabel ? (
              <span className="hidden text-xs text-foreground sm:inline font-medium">
                {userLabel}
              </span>
            ) : null}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
