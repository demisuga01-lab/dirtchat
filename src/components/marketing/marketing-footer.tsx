import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/40">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            D
          </div>
          <span className="font-medium text-foreground">Dirtchat</span>
          <span className="text-xs">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:text-foreground">
            Get started
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
