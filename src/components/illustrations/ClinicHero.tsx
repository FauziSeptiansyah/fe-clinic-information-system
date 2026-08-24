export function ClinicHero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 360" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Ilustrasi klinik dan tenaga medis">
      <defs>
        <linearGradient id="ch-blob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="ch-building" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="ch-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* Background blob */}
      <circle cx="220" cy="185" r="165" fill="url(#ch-blob)" />
      <circle cx="360" cy="70" r="26" fill="#d1fae5" opacity="0.9" />
      <circle cx="55" cy="290" r="18" fill="#fef3c7" opacity="0.9" />

      {/* Ground shadow */}
      <ellipse cx="220" cy="330" rx="150" ry="14" fill="#1d4ed8" opacity="0.06" />

      {/* Clinic building */}
      <rect x="235" y="120" width="140" height="170" rx="14" fill="url(#ch-building)" />
      <rect x="235" y="120" width="140" height="170" rx="14" fill="#1e3a8a" opacity="0.12" />
      {/* Windows */}
      <rect x="255" y="145" width="26" height="26" rx="4" fill="#bfdbfe" />
      <rect x="295" y="145" width="26" height="26" rx="4" fill="#bfdbfe" />
      <rect x="335" y="145" width="26" height="26" rx="4" fill="#bfdbfe" />
      <rect x="255" y="185" width="26" height="26" rx="4" fill="#bfdbfe" />
      <rect x="335" y="185" width="26" height="26" rx="4" fill="#bfdbfe" />
      {/* Cross emblem */}
      <rect x="293" y="180" width="30" height="30" rx="6" fill="#ffffff" />
      <rect x="304" y="187" width="8" height="16" rx="2" fill="#2563eb" />
      <rect x="297" y="194" width="22" height="8" rx="2" fill="#2563eb" />
      {/* Door */}
      <rect x="285" y="240" width="45" height="50" rx="6" fill="#1e40af" />
      <circle cx="320" cy="266" r="2.4" fill="#bfdbfe" />

      {/* Doctor figure (friendly, gender-neutral) */}
      <g>
        <ellipse cx="145" cy="292" rx="46" ry="10" fill="#0f172a" opacity="0.06" />
        {/* legs */}
        <rect x="128" y="240" width="14" height="46" rx="7" fill="#334155" />
        <rect x="152" y="240" width="14" height="46" rx="7" fill="#334155" />
        {/* coat body */}
        <path d="M108 175 C108 160 122 150 145 150 C168 150 182 160 182 175 L188 248 C188 256 182 262 174 262 L116 262 C108 262 102 256 102 248 Z" fill="url(#ch-coat)" stroke="#cbd5e1" strokeWidth="2" />
        {/* inner scrub */}
        <path d="M130 158 L145 172 L160 158 L160 200 L130 200 Z" fill="#2563eb" />
        {/* stethoscope */}
        <path d="M122 168 C118 190 118 205 134 210 C146 214 150 204 148 196" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
        <circle cx="148" cy="196" r="4" fill="#0f172a" opacity="0.55" />
        {/* head */}
        <circle cx="145" cy="128" r="26" fill="#f8cba0" />
        <path d="M119 122 C119 104 130 94 145 94 C160 94 171 104 171 122 C171 112 162 108 145 108 C128 108 119 112 119 122 Z" fill="#3f2d1c" />
        {/* arms */}
        <path d="M108 185 C96 195 92 210 96 226" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        <path d="M182 185 C196 196 200 212 194 228" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        {/* clipboard */}
        <rect x="182" y="212" width="26" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="187" y="219" width="16" height="2.5" fill="#94a3b8" />
        <rect x="187" y="225" width="16" height="2.5" fill="#94a3b8" />
        <rect x="187" y="231" width="10" height="2.5" fill="#94a3b8" />
      </g>

      {/* Pulse / heartbeat accent line */}
      <path
        d="M30 205 H70 L82 180 L96 232 L108 205 H150"
        stroke="#059669"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      <circle cx="30" cy="205" r="4" fill="#059669" />

      {/* Small floating plus badges */}
      <g opacity="0.9">
        <rect x="365" y="255" width="22" height="22" rx="6" fill="#10b981" />
        <rect x="373.5" y="260" width="5" height="12" rx="1.5" fill="white" />
        <rect x="369" y="264.5" width="14" height="5" rx="1.5" fill="white" />
      </g>
      <g opacity="0.85">
        <rect x="26" y="120" width="18" height="18" rx="5" fill="#3b82f6" />
        <rect x="33" y="124" width="4" height="10" rx="1.2" fill="white" />
        <rect x="30" y="127" width="10" height="4" rx="1.2" fill="white" />
      </g>
    </svg>
  );
}
