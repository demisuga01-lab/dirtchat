"use client";

/**
 * ModelConstellation — Animated SVG showing Dirtchat's model routing concept.
 *
 * A central workspace node connects to five AI provider nodes via route lines.
 * Each provider shows orbiting model dots. CSS animations handle the glow
 * and orbital motion, with prefers-reduced-motion support.
 */
export function ModelConstellation({ className }: { className?: string }) {
  const providers = [
    { label: "OpenAI", x: 140, y: 50 },
    { label: "Anthropic", x: 320, y: 85 },
    { label: "Google", x: 380, y: 230 },
    { label: "Meta", x: 80, y: 280 },
    { label: "xAI", x: 60, y: 150 },
  ];

  const center = { x: 220, y: 175 };

  return (
    <div className={className} aria-hidden="true">
      <style>{`
        @keyframes dc-route-dash {
          to { stroke-dashoffset: -24; }
        }
        @keyframes dc-orbit {
          0% { transform: rotate(0deg) translateX(18px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(18px) rotate(-360deg); }
        }
        @keyframes dc-pulse {
          0%, 100% { opacity: 0.6; r: 3; }
          50% { opacity: 1; r: 4; }
        }
        @keyframes dc-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dc-route-line { animation: none !important; }
          .dc-orbit-dot { animation: none !important; }
          .dc-pulse-dot { animation: none !important; }
          .dc-glow-ring { animation: none !important; }
        }
      `}</style>
      <svg
        viewBox="0 0 440 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto w-full max-w-lg"
      >
        <defs>
          <linearGradient id="dc-route-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.4" />
          </linearGradient>
          <filter id="dc-glow-filter">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="dc-center-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind center */}
        <circle cx={center.x} cy={center.y} r="80" fill="url(#dc-center-grad)" />

        {/* Route lines */}
        {providers.map((p, i) => (
          <line
            key={`route-${i}`}
            x1={center.x}
            y1={center.y}
            x2={p.x}
            y2={p.y}
            stroke="url(#dc-route-grad)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            className="dc-route-line"
            style={{
              animation: `dc-route-dash ${2 + i * 0.5}s linear infinite`,
            }}
          />
        ))}

        {/* Provider nodes */}
        {providers.map((p, i) => (
          <g key={`provider-${i}`}>
            {/* Outer glow ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r="22"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="0.5"
              opacity="0.3"
              className="dc-glow-ring"
              style={{
                animation: `dc-glow ${3 + i * 0.7}s ease-in-out infinite`,
              }}
            />

            {/* Node background */}
            <circle
              cx={p.x}
              cy={p.y}
              r="16"
              fill="#1a1a2e"
              stroke="#a78bfa"
              strokeWidth="1"
              opacity="0.8"
            />

            {/* Label */}
            <text
              x={p.x}
              y={p.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#e2e8f0"
              fontSize="7"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
            >
              {p.label}
            </text>

            {/* Orbiting model dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#34d399"
              className="dc-orbit-dot"
              style={{
                transformOrigin: `${p.x}px ${p.y}px`,
                animation: `dc-orbit ${5 + i * 1.5}s linear infinite`,
              }}
            />
          </g>
        ))}

        {/* Center workspace node — hexagon */}
        <polygon
          points={hexPoints(center.x, center.y, 28)}
          fill="#0f0f23"
          stroke="#6366f1"
          strokeWidth="2"
          filter="url(#dc-glow-filter)"
        />
        <text
          x={center.x}
          y={center.y - 3}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#c7d2fe"
          fontSize="8"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="600"
        >
          Workspace
        </text>
        <text
          x={center.x}
          y={center.y + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#6366f1"
          fontSize="6"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="400"
        >
          route &amp; compare
        </text>

        {/* Pulse dots on route lines */}
        {providers.map((p, i) => {
          const mx = center.x + (p.x - center.x) * 0.55;
          const my = center.y + (p.y - center.y) * 0.55;
          return (
            <circle
              key={`pulse-${i}`}
              cx={mx}
              cy={my}
              r="3"
              fill="#6366f1"
              className="dc-pulse-dot"
              style={{
                animation: `dc-pulse ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}
