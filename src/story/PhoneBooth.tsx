interface PhoneBoothProps {
  state: 'ringing' | 'picked'
  onPick: () => void
}

const DRIPS = [
  { x: 52, y: 96, d: 5.2 },
  { x: 88, y: 140, d: 6.8 },
  { x: 146, y: 110, d: 4.6 },
  { x: 188, y: 180, d: 7.4 },
  { x: 64, y: 230, d: 6.1 },
  { x: 176, y: 320, d: 5.7 },
  { x: 100, y: 360, d: 8.2 },
]

/** An original line-and-light phone booth. While ringing, the receiver rattles on the beat; picking it up plays the music. */
export function PhoneBooth({ state, onPick }: PhoneBoothProps) {
  return (
    <button
      type="button"
      className={`booth ${state === 'ringing' ? 'is-ringing' : 'is-picked'}`}
      onClick={onPick}
      aria-label={state === 'ringing' ? 'Pick up the phone: start the story with music' : 'Pick up the phone again'}
    >
      <svg viewBox="0 0 240 470" role="presentation" aria-hidden="true">
        <defs>
          <linearGradient id="booth-interior" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE2B3" />
            <stop offset="0.28" stopColor="#E9A866" />
            <stop offset="0.7" stopColor="#6B3B24" />
            <stop offset="1" stopColor="#24140E" />
          </linearGradient>
          <linearGradient id="booth-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="booth-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFC98A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFC98A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="120" cy="456" rx="168" ry="16" fill="url(#booth-pool)" className="booth-light" />
        <rect x="14" y="10" width="212" height="18" rx="4" fill="#10141F" />
        <rect x="26" y="28" width="188" height="36" fill="#FFE7BF" className="booth-light" />
        <text x="120" y="52" textAnchor="middle" className="booth-sign">
          TELEPHONE
        </text>
        <rect x="20" y="64" width="200" height="390" rx="3" fill="#0D1119" stroke="#232B3B" strokeWidth="2" />
        <rect x="32" y="74" width="176" height="366" fill="url(#booth-interior)" className="booth-light" />

        {/* phone on the back wall, seen through the right-hand pane */}
        <g>
          <rect x="146" y="196" width="40" height="64" rx="5" fill="#1B1E29" />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={156 + c * 10} cy={220 + r * 10} r="2.2" fill="#8A7A66" />))}
          <path className="booth-cord" d="M150 256 q-6 8 0 14 q6 6 0 12 q-6 6 0 12 q6 6 -2 14" fill="none" stroke="#1B1E29" strokeWidth="2.5" />
          <g className="booth-receiver">
            <path d="M134 198 q-8 0 -8 10 v44 q0 10 8 10 h6 q4 0 4 -5 v-8 q0 -4 -4 -4 h-3 v-30 h3 q4 0 4 -4 v-8 q0 -5 -4 -5 z" fill="#15171F" stroke="#3A3F52" strokeWidth="1.2" />
          </g>
        </g>
        <line x1="138" y1="292" x2="202" y2="292" stroke="#2A1A12" strokeWidth="3" />
        <g transform="translate(174 284)">
          {/* separate group: a CSS transform here would otherwise replace the translate above */}
          <g className="booth-flower">
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx="0" cy="-7" rx="2.6" ry="6" fill="#F6F3EC" transform={`rotate(${i * 40})`} />
            ))}
            <circle r="3.2" fill="#F2B544" />
            <line x1="0" y1="4" x2="-2" y2="8" stroke="#6E8B4E" strokeWidth="1.5" />
          </g>
        </g>

        {/* mullions, door, glass */}
        <rect x="117" y="74" width="6" height="366" fill="#0D1119" />
        <rect x="32" y="180" width="176" height="5" fill="#0D1119" />
        <rect x="32" y="304" width="176" height="5" fill="#0D1119" />
        <rect x="106" y="246" width="4" height="34" rx="2" fill="#3A3F52" />
        <rect x="32" y="74" width="176" height="366" fill="url(#booth-sheen)" />
        {DRIPS.map((d, i) => (
          <g key={i} className="booth-drip" style={{ animationDuration: `${d.d}s`, animationDelay: `${-i * 1.3}s` }}>
            <ellipse cx={d.x} cy={d.y} rx="1.8" ry="2.6" fill="#fff" fillOpacity="0.55" />
            <line x1={d.x} y1={d.y - 3} x2={d.x} y2={d.y - 18} stroke="#fff" strokeOpacity="0.18" strokeWidth="1.2" />
          </g>
        ))}
      </svg>
      <span className="booth-cta">{state === 'ringing' ? 'Pick up' : 'Hello?'}</span>
    </button>
  )
}
