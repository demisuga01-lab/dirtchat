/**
 * Static SVG brand mark for favicon / icon use.
 * This is a simplified version of the DirtchatLogo component.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
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
  );
}
