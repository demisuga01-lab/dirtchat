"use client";

import { cn } from "@/lib/utils";

const SIZES = { sm: 24, md: 36, lg: 48 } as const;

type LogoSize = keyof typeof SIZES;

interface DirtchatLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Original Dirtchat logo: a rounded-square "D" mark with an integrated
 * chat-bubble tail and model-routing line extending from it.
 *
 * The tail and route-line suggest conversations flowing to connected
 * model providers — the core Dirtchat concept.
 */
export function DirtchatLogo({
  size = "md",
  showWordmark = true,
  className,
}: DirtchatLogoProps) {
  const px = SIZES[size];

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="Dirtchat"
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="dc-bg" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="dc-route" x1="32" y1="36" x2="44" y2="44">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Rounded-square background with chat tail */}
        <path
          d="M4 12C4 7.58 7.58 4 12 4H36C40.42 4 44 7.58 44 12V30C44 34.42 40.42 38 36 38H30L26 42L24 38H12C7.58 38 4 34.42 4 30V12Z"
          fill="url(#dc-bg)"
        />

        {/* Letter D */}
        <path
          d="M16 13H24C29.52 13 34 17.48 34 23C34 28.52 29.52 33 24 33H16V13Z
             M20 17V29H24C27.31 29 30 26.31 30 23C30 19.69 27.31 17 24 17H20Z"
          fill="white"
          fillRule="evenodd"
        />

        {/* Route line extending from tail — model routing motif */}
        <line
          x1="26"
          y1="42"
          x2="38"
          y2="46"
          stroke="url(#dc-route)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Route terminus dot — represents a model provider node */}
        <circle cx="38" cy="46" r="2.5" fill="#34d399" />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight",
            size === "sm" && "text-base",
            size === "md" && "text-lg",
            size === "lg" && "text-xl"
          )}
        >
          Dirtchat
        </span>
      )}
    </span>
  );
}
