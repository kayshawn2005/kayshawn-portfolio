import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ChapterHead } from './ChapterHead'
import { PullPin } from './PullPin'
import { createFireworks, type Fireworks } from './fireworks'
import { AnimatedText } from '../components/AnimatedText'
import { ContactButton } from '../components/Buttons'
import { prefersReducedMotion } from '../components/FadeIn'
import { music, BEAT, DOWNBEAT } from '../lib/music'
import { CONTACT } from '../data/content'
import { NARRATION } from '../data/story'

const LANTERNS = 11

// A town's rooftops along the river, generated once from a fixed seed so it never changes between visits.
const SKYLINE = (() => {
  let seed = 7
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  let d = 'M0 160 L0 120 '
  for (let x = 0; x < 1440; ) {
    const w = 38 + r() * 86
    const h = 26 + r() * 64
    d += `L${x.toFixed(0)} ${(120 - h).toFixed(0)} `
    if (r() < 0.45) d += `L${(x + w / 2).toFixed(0)} ${(120 - h - 16 - r() * 10).toFixed(0)} `
    d += `L${(x + w).toFixed(0)} ${(120 - h).toFixed(0)} `
    x += w
  }
  return `${d}L1440 120 L1440 160 Z`
})()

function ContactCard() {
  return (
    <div className="contact-card">
      <p className="story-eyebrow">The pin is out</p>
      <h3 className="contact-title">Let&apos;s make something.</h3>
      <dl className="contact-list">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer">
              {CONTACT.instagramHandle}
            </a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
          </dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>{CONTACT.location}</dd>
        </div>
      </dl>
      <ContactButton label="Write to me" href={CONTACT.gmailComposeUrl} external />
    </div>
  )
}

/**
 * Chapter III: a summer festival. Shells go up on every other beat of the music (or every ~2 s without it);
 * tapping the sky launches one where you tapped. Pulling the pin ends in flowers — and the contact card.
 * Fireworks burst behind the words; the petals get their own canvas in front, so they drift over the card too.
 */
export function Festival() {
  const skyRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const petalsRef = useRef<HTMLCanvasElement | null>(null)
  const fw = useRef<Fireworks | null>(null)
  const petals = useRef<Fireworks | null>(null)
  const [pulled, setPulled] = useState(false)

  useEffect(() => {
    const sky = skyRef.current
    const canvas = canvasRef.current
    if (!sky || !canvas || prefersReducedMotion()) return
    const f = createFireworks(canvas)
    if (!f) return
    fw.current = f
    const p = petalsRef.current ? createFireworks(petalsRef.current) : null
    petals.current = p
    let raf = 0
    let visible = false
    let last = 0
    let lastBeat = -1
    let lastAuto = 0
    const auto = () => f.launch(sky.clientWidth * (0.12 + Math.random() * 0.76), sky.clientHeight * (0.1 + Math.random() * 0.28))
    const tick = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
      last = now
      if (music.playing()) {
        const b = Math.floor((music.time() - DOWNBEAT) / BEAT)
        if (b !== lastBeat) {
          lastBeat = b
          if (b % 2 === 0) auto()
        }
      } else if (now - lastAuto > 1900) {
        lastAuto = now
        auto()
      }
      f.frame(dt)
      p?.frame(dt)
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf && visible && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const ro = new ResizeObserver(() => {
      f.resize()
      p?.resize()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      wake()
    })
    io.observe(sky)
    document.addEventListener('visibilitychange', wake)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', wake)
      fw.current = null
      petals.current = null
    }
  }, [])

  const onSky = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button, .pin, .contact-card')) return
    const r = e.currentTarget.getBoundingClientRect()
    fw.current?.launch(e.clientX - r.left, e.clientY - r.top)
  }
  const onPull = (x: number, y: number) => {
    setPulled(true)
    const f = fw.current
    const r = skyRef.current?.getBoundingClientRect()
    if (!f || !r) return
    const px = x - r.left
    const py = y - r.top
    ;(petals.current ?? f).burst(px, py, 'bloom')
    ;[0, 1, 2].forEach((i) => window.setTimeout(() => f.burst(px + (i - 1) * 170, py - 150 - i * 30, i === 1 ? 'ring' : 'peony'), 180 + i * 150))
  }

  return (
    <section id="festival" className="chapter festival">
      <div ref={skyRef} className="festival-sky" onClick={onSky}>
        <div className="festival-stars" aria-hidden="true" />
        <div className="lanterns" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0 20 Q600 200 1200 20" fill="none" stroke="rgba(255,220,180,.35)" strokeWidth="1.5" />
          </svg>
          {Array.from({ length: LANTERNS }, (_, i) => {
            const t = (i + 0.5) / LANTERNS
            // the string is the quadratic M0 20 Q600 200 1200 20, so it hangs at y = 20 + 360·t·(1−t)
            return <span key={i} className="lantern" style={{ left: `${t * 100}%`, top: `${20 + 360 * t * (1 - t)}px`, animationDelay: `${-i * 0.37}s` }} />
          })}
        </div>
        <canvas ref={canvasRef} className="festival-canvas" aria-hidden="true" />
        <svg className="festival-skyline" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
          <path d={SKYLINE} fill="#06041A" />
        </svg>
        <div className="chapter-inner festival-content">
          <ChapterHead id="festival" />
          <AnimatedText text={NARRATION.festival} className="story-narration story-narration-lg" />
          <p className="festival-hint" aria-hidden="true">
            Tap the sky for fireworks
          </p>
          <div className="festival-pin-area">{pulled ? <ContactCard /> : <PullPin onPull={onPull} />}</div>
        </div>
        <canvas ref={petalsRef} className="festival-petals" aria-hidden="true" />
      </div>
    </section>
  )
}
