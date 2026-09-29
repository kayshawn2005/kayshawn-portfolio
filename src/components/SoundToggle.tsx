import { useEffect, useRef, useState } from 'react'
import { music, TRACK } from '../lib/music'
import { useMusicOn } from '../lib/useMusicOn'

/** Nav sound switch: four equalizer bars driven by the live track, plus a "now playing" credit. */
export function SoundToggle() {
  const on = useMusicOn()
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const [credit, setCredit] = useState(false)

  useEffect(() => {
    let raf = 0
    const idle = [0.18, 0.3, 0.22, 0.14]
    const tick = () => {
      const levels = music.bands(4)
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${on ? Math.max(0.12, Math.min(1, levels[i] * 1.35)) : idle[i]})`
      })
      if (on) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [on])

  // Credit the track for a few seconds each time the music comes on.
  useEffect(() => {
    let timer = 0
    let wasOn = music.on
    const unsubscribe = music.subscribe(() => {
      if (music.on && !wasOn) {
        setCredit(true)
        window.clearTimeout(timer)
        timer = window.setTimeout(() => setCredit(false), 3800)
      }
      wasOn = music.on
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => music.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Mute music' : `Play music: ${TRACK.title} by ${TRACK.artist}`}
      className={`sound-toggle ${credit ? 'show-credit' : ''}`}
    >
      <span className="sound-bars" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el
            }}
          />
        ))}
      </span>
      <span className="hidden md:inline">{on ? 'Sound on' : 'Sound off'}</span>
      <span className="sound-credit" role="status">
        ♪ {TRACK.title} — {TRACK.artist}
      </span>
    </button>
  )
}
