import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Picture } from './Picture'
import { prefersReducedMotion } from './FadeIn'
import { music, BAR, BEAT, DOWNBEAT } from '../lib/music'
import { REEL_TALL, REEL_WIDE, themeOf } from '../data/content'

const TALL = '(max-aspect-ratio: 4/5)'
const subscribeTall = (cb: () => void) => {
  const m = window.matchMedia(TALL)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

/**
 * The hero's 15-second reel: eight photos cut on the bar (8 bars at 130 BPM ≈ 14.8 s), each cut
 * marked by a shutter flash, each shot drifting in a slow Ken Burns move. Portrait screens get
 * portrait photographs rather than centre crops. While the soundtrack plays, cuts land on its downbeats.
 */
export function HeroReel() {
  const tall = useSyncExternalStore(subscribeTall, () => window.matchMedia(TALL).matches, () => false)
  const shots = tall ? REEL_TALL : REEL_WIDE
  const [idx, setIdx] = useState(0)
  const [mounted, setMounted] = useState(2) // shots mount one bar ahead, so the first paint only fetches two photos
  const rootRef = useRef<HTMLDivElement | null>(null)
  const flashRef = useRef<HTMLDivElement | null>(null)
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const n = shots.length
    let raf = 0
    let visible = true
    let last = 0
    let playing = music.playing()
    let lastT = music.time()
    let offset = -Math.floor((lastT - DOWNBEAT) / BAR)

    const tick = () => {
      raf = 0
      if (!visible || document.hidden) return
      const t = music.time()
      const bar = Math.floor((t - DOWNBEAT) / BAR)
      // Clock source changed (sound on/off) or the song looped: re-anchor. When the song starts from the top,
      // shot 1 lands on its first downbeat; otherwise the reel carries on from the current shot.
      if (music.playing() !== playing || t < lastT - 1) {
        playing = music.playing()
        offset = playing && t < 1 ? 0 : last - bar
      }
      lastT = t
      const i = (((bar + offset) % n) + n) % n
      if (i !== last) {
        last = i
        setIdx(i)
        setMounted((m) => Math.max(m, Math.min(n, i + 2)))
        flashRef.current?.animate([{ opacity: 0.42 }, { opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)' })
      }
      const beat = (((Math.floor((t - DOWNBEAT) / BEAT)) % 4) + 4) % 4
      dotsRef.current.forEach((d, k) => d?.classList.toggle('on', k === beat))
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      wake()
    })
    if (rootRef.current) io.observe(rootRef.current)
    document.addEventListener('visibilitychange', wake)
    wake()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', wake)
    }
  }, [shots])

  const shot = shots[idx]
  const theme = themeOf(shot.src)

  return (
    <div ref={rootRef} className="reel" role="img" aria-label="A reel of Kayshawn's photographs">
      {shots.slice(0, mounted).map((s, i) => (
        <Picture
          key={s.src}
          src={s.src}
          alt=""
          sizes="100vw"
          eager={i === 0}
          develop={false}
          className={`reel-shot ${i === idx ? 'is-on' : ''}`}
          style={{ objectPosition: s.pos ?? '50% 50%' }}
        />
      ))}
      <div ref={flashRef} className="reel-flash" aria-hidden="true" />
      <div className="reel-hud" aria-hidden="true">
        <span className="reel-dots">
          {[0, 1, 2, 3].map((k) => (
            <span
              key={k}
              ref={(el) => {
                dotsRef.current[k] = el
              }}
            />
          ))}
        </span>
        <span key={idx} className="reel-caption">
          {String(idx + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')} · {theme?.title ?? ''}
        </span>
      </div>
    </div>
  )
}
