export function EmptyQueueArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" className={className} role="img" aria-label="Tidak ada antrian">
      <ellipse cx="80" cy="104" rx="52" ry="8" fill="#0f172a" opacity="0.05" />
      {/* ticket */}
      <rect x="42" y="24" width="76" height="66" rx="10" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
      <circle cx="42" cy="57" r="6" fill="#f8fafc" stroke="#bfdbfe" strokeWidth="2" />
      <circle cx="118" cy="57" r="6" fill="#f8fafc" stroke="#bfdbfe" strokeWidth="2" />
      <rect x="58" y="38" width="44" height="6" rx="3" fill="#93c5fd" />
      <rect x="58" y="50" width="30" height="4.5" rx="2.25" fill="#cbd5e1" />
      {/* check circle */}
      <circle cx="80" cy="70" r="13" fill="#10b981" />
      <path d="M74 70 L78.5 74.5 L87 65" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
