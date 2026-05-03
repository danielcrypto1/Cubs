type Tier = "bronze" | "silver" | "gold" | "diamond";

const PALETTES: Record<Tier, { body: string; trim: string; lock: string; glow: string }> = {
  bronze: { body: "#7a4d2a", trim: "#c98a52", lock: "#3a2412", glow: "rgba(201,138,82,0.4)" },
  silver: { body: "#5b6770", trim: "#cbd5dd", lock: "#1f242a", glow: "rgba(203,213,221,0.45)" },
  gold: { body: "#b07a18", trim: "#ffd34d", lock: "#3b2710", glow: "rgba(255,211,77,0.55)" },
  diamond: { body: "#1f6f9a", trim: "#7ee5ff", lock: "#0c2533", glow: "rgba(126,229,255,0.55)" },
};

export function ChestIcon({ tier = "gold", size = 120 }: { tier?: Tier; size?: number }) {
  const c = PALETTES[tier];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 12px 24px ${c.glow})` }}
      aria-hidden
    >
      {/* Lid */}
      <path d="M30 70 Q100 30 170 70 L170 100 L30 100 Z" fill={c.body} />
      <path d="M30 70 Q100 30 170 70" stroke={c.trim} strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Lid trim band */}
      <rect x="30" y="92" width="140" height="10" fill={c.trim} />

      {/* Body */}
      <rect x="30" y="100" width="140" height="70" rx="6" fill={c.body} />

      {/* Vertical metal strips */}
      <rect x="56" y="100" width="6" height="70" fill={c.trim} />
      <rect x="138" y="100" width="6" height="70" fill={c.trim} />

      {/* Bottom band */}
      <rect x="30" y="160" width="140" height="10" fill={c.trim} />

      {/* Lock */}
      <rect x="92" y="92" width="16" height="22" rx="2" fill={c.lock} />
      <circle cx="100" cy="116" r="8" fill={c.lock} />
      <circle cx="100" cy="116" r="2.5" fill={c.trim} />

      {/* Highlight gleam on lid */}
      <path d="M50 80 Q100 56 150 80" stroke="white" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Sparkle */}
      <g fill={c.trim}>
        <circle cx="44" cy="60" r="2.5" />
        <circle cx="160" cy="56" r="2" />
        <circle cx="170" cy="80" r="1.5" />
      </g>
    </svg>
  );
}
