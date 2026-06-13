import { cn } from "@/lib/utils";

/**
 * Static SVG brand mark for favicon / icon use.
 * This matches the geometric Swiss D mark structure of DirtchatLogo.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
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
  );
}
