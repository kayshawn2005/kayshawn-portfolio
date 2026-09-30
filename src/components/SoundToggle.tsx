import { useEffect, useRef } from 'react'
import { music, TRACK } from '../lib/music'
import { useMusicOn } from '../lib/useMusicOn'

/**
 * Nav sound switch: four level bars that move with the song while it plays, and a label.
 * It sits outside the "first click starts the music" rule (data-sound-toggle), so tapping it always does
 * exactly what it says.
 */
export function SoundToggle() {
  const on = useMusicOn()
  const bars = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const idle = [0.25, 0.45, 0.35, 0.2]
    const tick = () => {
      const levels = music.bands(4)
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${on ? Math.max(0.15, Math.min(1, levels[i] * 1.35)) : idle[i]})`
      })
      if (on) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [on])

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => music.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Mute music' : `Play music: ${TRACK.title} by ${TRACK.artist}`}
      title={`${TRACK.title} · ${TRACK.artist}`}
      className="flex items-center gap-2 text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm hover:opacity-70 transition-opacity duration-200 cursor-pointer"
    >
      <span className="flex items-end gap-[2px] h-[14px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el
            }}
            className={`block w-[3px] h-[14px] rounded-[1px] origin-bottom transition-transform duration-100 ${on ? 'bg-[#D7E2EA]' : 'bg-[#D7E2EA]/50'}`}
          />
        ))}
      </span>
      <span className="hidden md:inline">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}
