import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            D
          </div>
          Dirtchat
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href="/sign-in" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button href="/sign-up" size="sm">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
