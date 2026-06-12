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
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path
        d="M4 12C4 7.58 7.58 4 12 4H36C40.42 4 44 7.58 44 12V30C44 34.42 40.42 38 36 38H30L26 42L24 38H12C7.58 38 4 34.42 4 30V12Z"
        fill="url(#bm-bg)"
      />
      <path
        d="M16 13H24C29.52 13 34 17.48 34 23C34 28.52 29.52 33 24 33H16V13Z
           M20 17V29H24C27.31 29 30 26.31 30 23C30 19.69 27.31 17 24 17H20Z"
        fill="white"
        fillRule="evenodd"
      />
      <circle cx="38" cy="46" r="2.5" fill="#34d399" />
    </svg>
  );
}
