// src/components/providers/provider-logo.tsx
//
// High-contrast monochrome vector logos for AI/API providers,
// following Swiss International design principles (bold geometry,
// pure black/white, minimal green accents).

import * as React from "react";
import { cn } from "@/lib/utils";

export function ProviderLogo({
  logoKey,
  className,
}: {
  logoKey?: string;
  className?: string;
}) {
  const cnStr = cn("h-6 w-6 shrink-0 text-foreground fill-current", className);

  switch (logoKey) {
    case "openai":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Simplified OpenAI geometric flower */}
          <circle cx="12" cy="12" r="2.5" className="fill-none stroke-current stroke-2" />
          <path d="M12 2v7.5M12 14.5v7.5M2 12h7.5M14.5 12H22M4.9 4.9l5.3 5.3M13.8 13.8l5.3 5.3M19.1 4.9l-5.3 5.3M10.2 13.8L4.9 19.1" className="stroke-current stroke-2" />
        </svg>
      );

    case "gemini":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Google Gemini 4-pointed spark */}
          <path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" />
        </svg>
      );

    case "anthropic":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Geometric Anthropic logo: stylized solid triangles forming 'A' */}
          <path d="M12 3L3 20h4.5l2.25-5h4.5l2.25 5H21L12 3zm1 8.5h-2L12 9l1 2.5z" />
        </svg>
      );

    case "openrouter":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Multi-node routing gateway */}
          <rect x="3" y="10" width="4" height="4" className="stroke-current stroke-2 fill-none" />
          <rect x="17" y="3" width="4" height="4" className="stroke-current stroke-2 fill-none" />
          <rect x="17" y="17" width="4" height="4" className="stroke-current stroke-2 fill-none" />
          <path d="M7 12h4m0 0l6-7m-6 7l6 7" className="stroke-current stroke-2" />
        </svg>
      );

    case "tokenrouter":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* TokenRouter: Concentric circles with cross-sectional arrow */}
          <circle cx="12" cy="12" r="8" className="stroke-current stroke-2 fill-none" />
          <circle cx="12" cy="12" r="4" className="stroke-current stroke-2 fill-none" strokeDasharray="2 2" />
          <path d="M7 7l10 10M17 13v4h-4" className="stroke-current stroke-2" />
        </svg>
      );

    case "deepseek":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Letter D with magnifying search node */}
          <path d="M6 4h6a8 8 0 0 1 0 16H6V4zm2 2v12h4a6 6 0 0 0 0-12H8z" />
          <circle cx="14" cy="14" r="3" className="stroke-current stroke-2 fill-background" />
          <path d="M16 16l3 3" className="stroke-current stroke-2" />
        </svg>
      );

    case "groq":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Groq Lightning/Speed Chevron */}
          <path d="M19 11.5h-6v-8l-8 9.5h6v8z" />
        </svg>
      );

    case "mistral":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Chevron forming M */}
          <path d="M4 18V6l8 6 8-6v12h-3V10l-5 3.75L7 10v8H4z" />
        </svg>
      );

    case "ollama":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Ollama mascot/outline in geometric style */}
          <path d="M12 2a6 6 0 0 0-6 6v3a4 4 0 0 0 1.2 2.8c-.2.5-.2 1-.2 1.5 0 2.5 2 4.5 4.5 4.5h1c2.5 0 4.5-2 4.5-4.5 0-.5 0-1-.2-1.5A4 4 0 0 0 18 11V8a6 6 0 0 0-6-6zm-3 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
      );

    case "cohere":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Cohere geometric cellular structure */}
          <path d="M12 2L4.5 6.5v9L12 20l7.5-4.5v-9L12 2zm-1 4.5h2v2h-2v-2zm-4.5 3h2v2h-2v-2zm11 0h2v2h-2v-2zm-6.5 4h2v2h-2v-2z" />
        </svg>
      );

    case "xai":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Stylized geometric letter X */}
          <path d="M4 4l6.5 7.5L4 19h3.5l4.75-5.5L17 19h3L13.25 11.5 20 4h-3.5L12 9.25 7 4H4zm9.5 7.5l4.5 5.2h-1.8l-4.5-5.2h1.8z" />
        </svg>
      );

    case "perplexity":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* Perplexity concentric ring node */}
          <circle cx="12" cy="12" r="9" className="stroke-current stroke-2 fill-none" />
          <path d="M12 3v18M3 12h18" className="stroke-current stroke-2" />
        </svg>
      );

    case "litellm":
      return (
        <svg viewBox="0 0 24 24" className={cnStr} aria-hidden="true">
          {/* LiteLLM featherweight scales/shield */}
          <path d="M12 3L4 6v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V6l-8-3zm-1 14l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z" />
        </svg>
      );

    default:
      // Fallback: Clean initials/text box
      const initials = logoKey ? logoKey.slice(0, 3).toUpperCase() : "API";
      return (
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center bg-secondary border border-border text-[9px] font-bold uppercase tracking-wider text-foreground",
            className
          )}
        >
          {initials}
        </div>
      );
  }
}
