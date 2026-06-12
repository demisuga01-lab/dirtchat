"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirtchatLogo } from "@/components/brand/dirtchat-logo";
import { ThemeToggle } from "@/components/app/theme-toggle";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/why-dirtchat", label: "Why Dirtchat" },
];

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-md">
      {/* Desktop: three-zone grid for true center symmetry */}
      <div className="mx-auto hidden h-[72px] max-w-[1600px] items-center px-6 md:grid lg:px-10 2xl:px-14"
        style={{ gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)" }}>
        {/* Brand zone — pinned left */}
        <div className="justify-self-start">
          <Link
            href="/"
            className="flex items-center"
          >
            <DirtchatLogo size="md" showWordmark />
          </Link>
        </div>

        {/* Center nav zone — truly centered in viewport */}
        <nav className="justify-self-center flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions zone — pinned right */}
        <div className="justify-self-end flex items-center gap-2.5">
          <ThemeToggle />
          <Button href="/sign-in" variant="ghost" size="default" className="text-sm">
            Sign in
          </Button>
          <Button href="/sign-up" size="default">
            Get started
          </Button>
        </div>
      </div>

      {/* Mobile: flex layout with hamburger */}
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-6 md:hidden lg:px-10 2xl:px-14">
        <Link
          href="/"
          className="flex items-center"
        >
          <DirtchatLogo size="md" showWordmark />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="flex flex-col gap-1 border-t border-border/60 bg-background px-6 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-1.5 border-t border-border/30" />
          <Link
            href="/sign-in"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setMobileOpen(false)}
            className="mt-1 rounded-md bg-primary px-4 py-2.5 text-center text-[15px] font-medium text-primary-foreground"
          >
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}
