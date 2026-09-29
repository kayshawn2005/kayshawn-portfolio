import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ChapterHead } from './ChapterHead'
import { AnimatedText } from '../components/AnimatedText'
import { Picture } from '../components/Picture'
import { prefersReducedMotion } from '../components/FadeIn'
import { music, BAR, DOWNBEAT } from '../lib/music'
import { NARRATION, WORLDS } from '../data/story'

/** Photos that cross-fade every two bars of the song, so both worlds change on the same beat. */
function Slideshow({ shots }: { shots: string[] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) return
    let raf = 0
    let visible = false
    let last = 0
    const tick = () => {
      raf = 0
      if (!visible || document.hidden) return
      const i = (((Math.floor((music.time() - DOWNBEAT) / (BAR * 2)) % shots.length) + shots.length) % shots.length)
      if (i !== last) {
        last = i
        setIdx(i)
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(tick)
    })
    if (ref.current) io.observe(ref.current)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [shots.length])

  return (
    <div ref={ref} className="slideshow">
      {shots.map((s, i) => (
        <Picture key={s} src={s} sizes="100vw" develop={false} eager={i < 2} className={`slide ${i === idx ? 'is-on' : ''}`} />
      ))}
    </div>
  )
}

function Mouse({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 48 28" className="world-mouse" style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <path d="M6 22c0-8 7-15 17-15 7 0 12 3 15 8l6 1-3 4c-2 2-5 3-9 3H9c-2 0-3-.5-3-1z" fill="currentColor" />
      <circle cx="31" cy="9" r="4" fill="currentColor" />
      <circle cx="38" cy="17" r="1.2" fill="#0C0C0C" />
      <path d="M6 22c-3 0-5 1-5 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Chapter II: the town mouse and the country mouse — drag the line between my two worlds of work. */
export function TwoWorlds() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)
  const [split, setSplit] = useState(50)
  const [touched, setTouched] = useState(false)

  const moveTo = (clientX: number) => {
    const r = stageRef.current?.getBoundingClientRect()
    if (!r) return
    setSplit(Math.min(94, Math.max(6, ((clientX - r.left) / r.width) * 100)))
    setTouched(true)
  }
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a')) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    moveTo(e.clientX)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    setSplit((s) => Math.min(94, Math.max(6, s + step)))
    setTouched(true)
  }

  return (
    <section id="two-worlds" className="chapter worlds-chapter">
      <div className="chapter-inner">
        <ChapterHead id="two-worlds" />
        <AnimatedText text={NARRATION.twoWorlds} className="story-narration story-narration-lg" />
      </div>

      <div
        ref={stageRef}
        className={`worlds ${touched ? 'is-touched' : ''}`}
        style={{ '--split': `${split}%` } as CSSProperties}
        onPointerDown={onDown}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {(['city', 'country'] as const).map((side) => {
          const w = WORLDS[side]
          return (
            <div key={side} className={`world world-${side}`}>
              <Slideshow shots={w.shots} />
              <div className="world-shade" aria-hidden="true" />
              <div className="world-label">
                <Mouse flip={side === 'city'} />
                <p className="world-name">{w.label}</p>
                <p className="world-line">{w.line}</p>
                <a href={`#/gallery/${side}`} className="world-cta">
                  {w.cta} <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          )
        })}
        <div
          className="worlds-divider"
          role="slider"
          tabIndex={0}
          aria-label="Move the line between the country and the city"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(split)}
          aria-valuetext={`${Math.round(split)}% country, ${100 - Math.round(split)}% city`}
          onKeyDown={onKey}
        >
          <span className="worlds-handle" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <p className="worlds-hint" aria-hidden="true">
          Drag the line
        </p>
      </div>
    </section>
  )
}
