import React from "react";

export function RoutingMapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 
        The SVG uses viewBox="0 0 1600 800" and preserveAspectRatio="xMidYMid slice".
        This guarantees the aspect ratio is maintained and fills the parent hero section,
        scaling gracefully.
      */}
      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle grid system (Swiss International alignment) */}
        <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.02" strokeDasharray="4 8">
          <line x1="100" y1="0" x2="100" y2="800" />
          <line x1="300" y1="0" x2="300" y2="800" />
          <line x1="500" y1="0" x2="500" y2="800" />
          <line x1="700" y1="0" x2="700" y2="800" />
          <line x1="900" y1="0" x2="900" y2="800" />
          <line x1="1100" y1="0" x2="1100" y2="800" />
          <line x1="1300" y1="0" x2="1300" y2="800" />
          <line x1="1500" y1="0" x2="1500" y2="800" />

          <line x1="0" y1="100" x2="1600" y2="100" />
          <line x1="0" y1="250" x2="1600" y2="250" />
          <line x1="0" y1="400" x2="1600" y2="400" />
          <line x1="0" y1="550" x2="1600" y2="550" />
          <line x1="0" y1="700" x2="1600" y2="700" />
        </g>

        {/* Faint route paths */}
        <g stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.07">
          {/* Path 1: Top-Right to Mid-Right */}
          <path d="M 900 100 H 1200 V 300 H 1400 V 550" />
          {/* Path 2: Center-Right down */}
          <path d="M 1100 250 V 400 H 1300 V 700" />
          {/* Path 3: Mid-Left to Mid-Center-Right */}
          <path d="M 700 400 V 550 H 1100 V 600" />
          {/* Path 5: Bottom-Left-ish to Bottom-Right */}
          <path d="M 300 700 H 900 V 650 H 1300" />
        </g>

        {/* Stronger anchor lines for structural rhythm */}
        <g stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.14">
          {/* Main vertical anchor on the right */}
          <path d="M 1500 100 V 700 H 1300" />
          {/* Horizontal anchor on the bottom */}
          <path d="M 500 550 H 900 V 250 H 1100" />
        </g>

        {/* Node Markers - Default (small circles) */}
        <g fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12">
          <circle cx="900" cy="100" r="3.5" className="fill-background" />
          <circle cx="1200" cy="300" r="2.5" />
          <circle cx="1100" cy="250" r="3" className="fill-background" strokeWidth="1.25" />
          <circle cx="700" cy="400" r="2" />
          <circle cx="1100" cy="550" r="2.5" />
          <circle cx="1100" cy="600" r="2" />
          <circle cx="1300" cy="700" r="3.5" className="fill-background" />
          <circle cx="300" cy="700" r="3" />
          <circle cx="900" cy="650" r="2.5" />
          <circle cx="1300" cy="650" r="2" />
          <circle cx="1500" cy="100" r="3" />
          <circle cx="1500" cy="700" r="4.5" className="fill-background" strokeWidth="1.25" />
        </g>

        {/* Restrained light-green accents on only a few nodes or route markers */}
        <g fill="currentColor" stroke="currentColor" strokeWidth="0.75" opacity="0.35">
          {/* Accent node 1 - Top Right intersection */}
          <circle cx="1400" cy="300" r="3.5" className="text-accent fill-accent" />
          <circle cx="1400" cy="300" r="7.5" fill="none" className="text-accent" strokeWidth="0.75" />
          
          {/* Accent node 2 - Center-Right junction */}
          <circle cx="1300" cy="400" r="3" className="text-accent fill-accent" />

          {/* Accent node 3 - Bottom-Center */}
          <circle cx="900" cy="550" r="4" className="text-accent fill-accent" />
          <circle cx="900" cy="550" r="8.5" fill="none" className="text-accent" strokeWidth="0.75" />
        </g>

        {/* Technical/Editorial Labels */}
        <g fill="currentColor" className="font-mono text-[8px] tracking-wider select-none opacity-20">
          <text x="915" y="103">[SYS-NODE-01]</text>
          <text x="1215" y="303">[RT-JNC.08]</text>
          <text x="1415" y="303" className="text-accent fill-accent font-semibold">[ACC.FLOW]</text>
          <text x="1115" y="403">[PATH.09.B]</text>
          <text x="1315" y="703">[TERM-02]</text>
          <text x="315" y="703">FLOW_CTRL_READY</text>
          <text x="1515" y="703">X:1500 Y:700</text>
          <text x="915" y="553" className="text-accent fill-accent font-semibold">[ANCR-C]</text>
        </g>
      </svg>

      {/* Subtle overlay gradient to smoothly fade the background near the left edge for absolute text clarity */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent w-[35%]" />
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent h-[15%] top-auto" />
    </div>
  );
}
