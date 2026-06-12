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
      className={cn("inline-flex items-center gap-2.5", className)}
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
        {/* Background container */}
        <rect
          width="48"
          height="48"
          rx="12"
          fill="#030303"
          stroke="rgba(34, 197, 94, 0.2)"
          strokeWidth="1.5"
        />

        {/* Outer loop of D representing the workspace envelope */}
        <path
          d="M14 12H25C31.627 12 37 17.373 37 24C37 30.627 31.627 36 25 36H14V12Z"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dynamic connection lines (model routing pathways) */}
        {/* Pathway 1 (Green) */}
        <path
          d="M19 18H25"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="27" cy="18" r="1.5" fill="#22c55e" />

        {/* Pathway 2 (White) */}
        <path
          d="M19 24H28"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="30" cy="24" r="1.5" fill="white" />

        {/* Pathway 3 (Green) */}
        <path
          d="M19 30H22"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="30" r="1.5" fill="#22c55e" />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg"
          )}
        >
          Dirtchat
        </span>
      )}
    </span>
  );
}
