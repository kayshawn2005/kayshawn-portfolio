import { useEffect, useRef, useState } from 'react'
import { music, TRACK } from '../lib/music'
import { prefersReducedMotion } from './FadeIn'

type Stage = 'open' | 'leaving' | 'done'

/**
 * Entry screen. Browsers only allow sound after a click or tap, so the site opens on a shutter button:
 * pressing it fires a flash, the screen closes like an aperture onto the site, and the soundtrack fades in.
 * Skipped for visitors who muted the music before; closes by itself when the browser already allows autoplay.
 */
export function IntroGate() {
  const [stage, setStage] = useState<Stage>(() => (music.wantsSound() ? 'open' : 'done'))
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const flashRef = useRef<HTMLDivElement | null>(null)

  const leave = () => {
    if (prefersReducedMotion()) return setStage('done')
    flashRef.current?.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 450, easing: 'ease-out' })
    setStage('leaving')
    window.setTimeout(() => setStage('done'), 1000)
  }

  useEffect(() => {
    if (stage !== 'open') return
    buttonRef.current?.focus({ preventScroll: true })
    document.documentElement.style.overflow = 'hidden'
    let alive = true
    void music.tryAutoplay().then((ok) => {
      if (ok && alive) leave()
    })
    return () => {
      alive = false
      document.documentElement.style.overflow = ''
    }
  }, [stage])

  if (stage === 'done') return null

  return (
    <div className={`gate ${stage === 'leaving' ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="gate-name">
      <div className="gate-inner">
        <p className="gate-eyebrow">K Picture Studio · Photography</p>
        <p id="gate-name" className="gate-name">
          Kayshawn Yen
        </p>
        <button
          ref={buttonRef}
          type="button"
          className="gate-shutter"
          onClick={() => {
            void music.enable()
            leave()
          }}
        >
          <span className="gate-shutter-disc" aria-hidden="true" />
          <span className="gate-shutter-label">Enter</span>
        </button>
        <p className="gate-credit">
          with sound · ♪ {TRACK.title} — {TRACK.artist}
        </p>
        <button
          type="button"
          className="gate-quiet"
          onClick={() => {
            music.disable()
            leave()
          }}
        >
          Enter without sound
        </button>
      </div>
      <div ref={flashRef} className="gate-flash" aria-hidden="true" />
    </div>
  )
}
