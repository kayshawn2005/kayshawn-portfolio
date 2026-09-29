import { useRef, useState, type PointerEvent } from 'react'

const REST = 58 // ring's resting distance from the socket (px)
const PULL = 130 // drag distance that pulls the pin out
const MAX = 200

/**
 * A ring-pull pin — the story's nod to a certain choker. Drag the ring until the pin comes free
 * (or just click / press Enter); what bursts out is flowers, not fire.
 */
export function PullPin({ onPull }: { onPull: (x: number, y: number) => void }) {
  const ringRef = useRef<HTMLButtonElement | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [pulling, setPulling] = useState(false)
  const [gone, setGone] = useState(false)

  const pull = () => {
    if (gone) return
    setGone(true)
    const r = ringRef.current?.getBoundingClientRect()
    if (r) onPull(r.left + r.width / 2, r.top + r.height / 2)
  }
  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    start.current = { x: e.clientX, y: e.clientY }
    dragged.current = false
    setPulling(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!start.current || gone) return
    let dx = e.clientX - start.current.x
    let dy = e.clientY - start.current.y
    const len = Math.hypot(dx, dy)
    if (len > 4) dragged.current = true
    if (len > MAX) {
      dx *= MAX / len
      dy *= MAX / len
    }
    setOff({ x: dx, y: dy })
    if (len > PULL) pull()
  }
  const onUp = () => {
    start.current = null
    setPulling(false)
    if (!gone) setOff({ x: 0, y: 0 })
  }

  const tx = REST + off.x
  const ty = off.y
  const strain = Math.min(1, Math.hypot(off.x, off.y) / PULL)

  return (
    <div className={`pin ${pulling ? 'is-pulling' : ''} ${gone ? 'is-gone' : ''}`}>
      <svg className="pin-tether" width="1" height="1" aria-hidden="true">
        <line x1="0" y1="0" x2={tx} y2={ty} stroke={`rgba(255,${220 - strain * 90},${200 - strain * 120},0.9)`} strokeWidth={2.5 - strain} strokeLinecap="round" />
      </svg>
      <span className="pin-socket" aria-hidden="true" />
      <button
        ref={ringRef}
        type="button"
        className="pin-ring"
        style={{ transform: `translate(${tx}px, ${ty}px) translate(-50%, -50%) rotate(${off.x * 0.15}deg)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false
            return
          }
          pull()
        }}
        aria-label="Pull the pin to reveal my contact details"
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="pin-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F4F1EA" />
              <stop offset="0.5" stopColor="#9EA7B3" />
              <stop offset="1" stopColor="#E9ECF1" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="22" fill="none" stroke="url(#pin-metal)" strokeWidth="6" />
        </svg>
      </button>
      <span className="pin-hint">{gone ? '' : 'Pull the pin'}</span>
    </div>
  )
}
