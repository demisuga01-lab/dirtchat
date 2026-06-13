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
 * Geometric Swiss D logo mark with single green thread accent.
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
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Geometric square background container */}
        <rect
          width="100"
          height="100"
          fill="#030303"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />

        {/* The "D" structure: Swiss geometric construction with chamfered corners */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25 20H65L77 32V68L65 80H25V20ZM37 32H65V68H37V32Z"
          fill="white"
        />

        {/* Internal "Thread" accent: Light Green */}
        <rect x="47" y="40" width="8" height="20" fill="#22c55e" />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-mono text-xs uppercase tracking-[0.25em] font-bold text-foreground select-none",
            size === "sm" && "text-[10px] tracking-[0.2em]",
            size === "md" && "text-xs",
            size === "lg" && "text-sm"
          )}
        >
          Dirtchat
        </span>
      )}
    </span>
  );
}
