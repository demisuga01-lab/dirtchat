import Link from "next/link";
import { DirtchatLogo } from "@/components/brand/dirtchat-logo";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/why-dirtchat", label: "Why Dirtchat" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const authLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Get started" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center">
              <DirtchatLogo size="sm" showWordmark />
            </Link>
            <p className="mt-4 max-w-xs text-xs text-muted-foreground leading-relaxed">
              A private AI workspace for people who work across multiple
              providers and want one clean place to work.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-mono tracking-widest text-accent uppercase">
              [ PRODUCT ]
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs uppercase tracking-wider font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-mono tracking-widest text-accent uppercase">
              [ LEGAL ]
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs uppercase tracking-wider font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-mono tracking-widest text-accent uppercase">
              [ ACCOUNT ]
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {authLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs uppercase tracking-wider font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] font-mono tracking-wider text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} DIRTCHAT. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-2">
            <span>[ SYSTEM OVERSEER: SECURE ]</span>
            <span className="h-1.5 w-1.5 bg-accent" />
          </div>
        </div>
      </div>
    </footer>
  );
}
