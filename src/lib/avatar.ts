const AVATAR_PALETTE = [
  { gradient: "from-blue-500 to-indigo-600", ring: "ring-blue-200" },
  { gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-200" },
  { gradient: "from-violet-500 to-purple-600", ring: "ring-violet-200" },
  { gradient: "from-amber-500 to-orange-600", ring: "ring-amber-200" },
  { gradient: "from-rose-500 to-pink-600", ring: "ring-rose-200" },
  { gradient: "from-cyan-500 to-sky-600", ring: "ring-cyan-200" },
  { gradient: "from-indigo-500 to-blue-700", ring: "ring-indigo-200" },
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic gradient pair for a person's name, used as an avatar fallback until a real photo exists. */
export function getAvatarGradient(name: string) {
  const palette = AVATAR_PALETTE[hashName(name || "?") % AVATAR_PALETTE.length];
  return palette;
}

export function getInitials(name: string): string {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";
}
