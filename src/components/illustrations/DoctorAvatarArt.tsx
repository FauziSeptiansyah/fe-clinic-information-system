const VARIANTS = [
  { bg: "#dbeafe", ring: "#93c5fd", hair: "#3f2d1c", coat: "#2563eb" },
  { bg: "#dcfce7", ring: "#86efac", hair: "#1c1917", coat: "#059669" },
  { bg: "#ede9fe", ring: "#c4b5fd", hair: "#57534e", coat: "#7c3aed" },
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Flat-style illustrated bust avatar for a doctor, picked deterministically from the person's name. Used until a real photo is uploaded. */
export function DoctorAvatarArt({ name, className }: { name: string; className?: string }) {
  const v = VARIANTS[hashName(name || "?") % VARIANTS.length];

  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-label={`Ilustrasi avatar ${name}`}>
      <circle cx="40" cy="40" r="39" fill={v.bg} stroke={v.ring} strokeWidth="2" />
      {/* shoulders / coat */}
      <path d="M12 78 C12 58 24 48 40 48 C56 48 68 58 68 78 Z" fill={v.coat} />
      <path d="M30 52 L40 64 L50 52 L50 80 L30 80 Z" fill="#ffffff" opacity="0.9" />
      {/* head */}
      <circle cx="40" cy="34" r="16" fill="#f0b487" />
      <path d="M24 30 C24 18 31 11 40 11 C49 11 56 18 56 30 C56 23 49 20 40 20 C31 20 24 23 24 30 Z" fill={v.hair} />
      {/* stethoscope hint */}
      <path d="M31 54 C29 63 30 69 37 71" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35" />
      <circle cx="37" cy="71" r="2.4" fill="#0f172a" opacity="0.35" />
    </svg>
  );
}
