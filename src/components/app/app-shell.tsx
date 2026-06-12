"use client";

import * as React from "react";
import { Sidebar } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export interface AppShellProps {
  title: string;
  userLabel?: string;
  children: React.ReactNode;
}

export function AppShell({ title, userLabel, children }: AppShellProps) {
  const [navOpen, setNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-[100dvh] w-full">
      <Sidebar />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {userLabel ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {userLabel}
              </span>
            ) : null}
            <ThemeToggle />
            <div className="hidden sm:block">
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
