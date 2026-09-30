import { useEffect, useRef, useState } from 'react'
import { PhoneCall, SpeakerSlash } from '@phosphor-icons/react'
import { LINES } from '../data/story'
import { music } from '../lib/music'
import { lockScroll } from '../lib/scrollLock'
import { easeInOut, prefersReducedMotion } from '../lib/motion'
import { director } from './director'

type Stage = 'ringing' | 'picking' | 'gone'

/** Animate a value over `ms` on rAF; resolves when done. */
function tween(ms: number, step: (t: number) => void) {
  return new Promise<void>((done) => {
    const t0 = performance.now()
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      step(t)
      if (t < 1) requestAnimationFrame(frame)
      else done()
    }
    requestAnimationFrame(frame)
  })
}

/**
 * Prologue: a phone rings in a booth in the rain. Picking it up is the click browsers require before a page may
 * play sound, so the music starts here. The camera pushes into the booth, the light whites out, and the café fades in.
 * Until then the page is held at the booth, so every visit starts at the beginning.
 */
export function Booth() {
  const [stage, setStage] = useState<Stage>('ringing')
  const release = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (window.location.hash.length > 2) return // deep link into the page: don't hold it at the booth
    window.scrollTo({ top: 0, behavior: 'instant' })
    release.current = lockScroll()
    void music.tryAutoplay()
    const reset = () => {
      director.boothPush = -1
      director.flash = 0
      setStage('ringing')
      release.current?.()
      release.current = lockScroll()
    }
    window.addEventListener('story:restart', reset)
    return () => {
      window.removeEventListener('story:restart', reset)
      release.current?.()
      release.current = null
    }
  }, [])

  const enter = async (withSound: boolean) => {
    if (stage !== 'ringing') return
    if (withSound) void music.enable()
    else music.disable()
    setStage('picking')
    const cafe = document.getElementById('cafe')
    if (prefersReducedMotion()) {
      release.current?.()
      release.current = null
      cafe?.scrollIntoView({ behavior: 'instant', block: 'start' })
      setStage('gone')
      return
    }
    await tween(1400, (t) => {
      director.boothPush = 0.5 + 0.5 * easeInOut(t)
      director.flash = Math.max(0, (t - 0.55) / 0.45) ** 2
    })
    release.current?.()
    release.current = null
    cafe?.scrollIntoView({ behavior: 'instant', block: 'start' })
    director.boothPush = -1
    setStage('gone')
    await tween(1100, (t) => {
      director.flash = 1 - easeInOut(t)
    })
    director.flash = 0
  }

  return (
    <section id="booth" data-plate="booth" className={`booth is-${stage}`}>
      <div className="booth-hero">
        <p className="kicker">A photography portfolio</p>
        <h1 className="booth-name">Kayshawn Yen</h1>
        <p className="booth-sub">Photographer in Los Angeles. Bridal editorial on the coast, character work at conventions.</p>
        <div className="booth-actions">
          <button type="button" className="button is-solid ring" onClick={() => void enter(true)}>
            <PhoneCall size={18} weight="fill" aria-hidden="true" />
            Pick up
          </button>
          <button type="button" className="button is-quiet" onClick={() => void enter(false)}>
            <SpeakerSlash size={16} aria-hidden="true" />
            Enter without sound
          </button>
        </div>
      </div>
      <div className="booth-lines" aria-hidden="true">
        {LINES.booth.map((line, i) => (
          <p key={line} className="subtitle" style={{ animationDelay: `${0.8 + i * 1.6}s` }}>
            {line}
          </p>
        ))}
      </div>
    </section>
  )
}
