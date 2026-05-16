"use client";

interface SilhouetteOverlayProps {
  dimmed?: boolean;
}

export function SilhouetteOverlay({ dimmed = false }: SilhouetteOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
      style={{ opacity: dimmed ? 0.25 : 1 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 768 1024"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <mask id="guide-mask">
            <rect width="768" height="1024" fill="white" />
            {/* Full-body guide cutout */}
            <rect x="184" y="40" width="400" height="944" rx="40" fill="black" />
          </mask>
        </defs>

        {/* Dark edges — white center */}
        <rect
          width="768"
          height="1024"
          fill="rgba(0,0,0,0.45)"
          mask="url(#guide-mask)"
        />

        {/* Guide frame border */}
        <rect
          x="184" y="40"
          width="400" height="944"
          rx="40"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
          strokeDasharray="18 10"
        />

        {/* Corner markers */}
        <g stroke="white" strokeWidth="3" strokeLinecap="round">
          {/* Top-left */}
          <line x1="184" y1="40" x2="224" y2="40" />
          <line x1="184" y1="40" x2="184" y2="80" />
          {/* Top-right */}
          <line x1="584" y1="40" x2="544" y2="40" />
          <line x1="584" y1="40" x2="584" y2="80" />
          {/* Bottom-left */}
          <line x1="184" y1="984" x2="224" y2="984" />
          <line x1="184" y1="984" x2="184" y2="944" />
          {/* Bottom-right */}
          <line x1="584" y1="984" x2="544" y2="984" />
          <line x1="584" y1="984" x2="584" y2="944" />
        </g>

        {/* Head circle guide */}
        <circle
          cx="384" cy="160"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />

        {/* Feet line guide */}
        <line
          x1="254" y1="940" x2="514" y2="940"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
      </svg>
    </div>
  );
}
