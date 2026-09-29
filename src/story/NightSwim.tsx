import { useEffect, useRef, useState } from 'react'
import { ChapterHead } from './ChapterHead'
import { createPool, type Float, type Pool } from './pool'
import { AnimatedText } from '../components/AnimatedText'
import { Picture } from '../components/Picture'
import { prefersReducedMotion } from '../components/FadeIn'
import { music, BEAT, DOWNBEAT } from '../lib/music'
import { sizedSrc } from '../lib/photos'
import { clamp01 } from '../lib/scroll'
import { THEMES } from '../data/content'
import { NARRATION, POOL } from '../data/story'

// Phones: the floats zig-zag down a taller pool instead.
const NARROW_LAYOUT = [
  [0.3, 0.17],
  [0.7, 0.33],
  [0.3, 0.5],
  [0.7, 0.67],
  [0.32, 0.84],
]

/**
 * Chapter III: the featured series float on a night pool. The water is WebGL (ripples follow the pointer,
 * and a drop falls on every other beat while the music plays); each float is also a real link laid over the
 * canvas, so keyboards and screen readers get the same way in. Without WebGL2 the photos simply float.
 */
export function NightSwim() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const links = useRef<(HTMLAnchorElement | null)[]>([])
  const [gl, setGl] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const still = prefersReducedMotion()
    let pool: Pool | null = null
    let raf = 0
    let visible = false
    let alive = true
    let lastBeat = -1
    let pointer: { x: number; y: number } | null = null

    const layout = (t: number): Float[] => {
      const W = stage.clientWidth
      const H = stage.clientHeight
      const narrow = W < 700
      const r = stage.getBoundingClientRect()
      const drift = still ? 0 : clamp01((window.innerHeight - r.top) / (r.height + window.innerHeight)) - 0.5
      return POOL.map((f, i) => {
        const [px, py] = narrow ? NARROW_LAYOUT[i] : [f.x, f.y]
        const bob = still ? 0 : 1
        return {
          x: px * W + bob * Math.sin(t * 0.3 + i * 2) * 10 + drift * 50 * (i % 2 ? 1 : -1),
          y: py * H + bob * Math.sin(t * 0.9 + i * 1.7) * 6,
          w: (narrow ? 0.4 : f.w) * W,
          rot: (f.rot * Math.PI) / 180 + bob * Math.sin(t * 0.5 + i) * 0.035,
        }
      })
    }
    const place = (floats: Float[]) =>
      floats.forEach((f, i) => {
        const a = links.current[i]
        if (!a) return
        a.style.width = `${f.w}px`
        a.style.transform = `translate(${f.x - f.w / 2}px, ${f.y - f.w * 0.625}px) rotate(${f.rot}rad)`
      })

    const tick = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const t = now / 1000
      const floats = layout(t)
      place(floats)
      if (pool) {
        if (pointer) {
          pool.drop(pointer.x, pointer.y, 0.012, 0.02)
          pointer = null
        }
        if (music.playing()) {
          const b = Math.floor((music.time() - DOWNBEAT) / BEAT)
          if (b !== lastBeat) {
            lastBeat = b
            if (b % 2 === 0) pool.drop(Math.random() * stage.clientWidth, Math.random() * stage.clientHeight, 0.02, 0.035)
          }
        } else if (Math.random() < 0.012) {
          pool.drop(Math.random() * stage.clientWidth, Math.random() * stage.clientHeight, 0.012, 0.025)
        }
        pool.render(t, floats)
      }
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!still && !raf && visible && !document.hidden) raf = requestAnimationFrame(tick)
    }

    place(layout(0))
    if (!still) {
      createPool(canvas, POOL.map((p) => sizedSrc(p.src, 600)))
        .then((p) => {
          if (!alive) return p?.destroy()
          if (!p) return
          pool = p
          setGl(true)
          wake()
        })
        .catch(() => {})
    }

    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: PointerEvent) => (pointer = local(e))
    const onDown = (e: PointerEvent) => {
      const p = local(e)
      pool?.drop(p.x, p.y, 0.06, 0.045)
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerdown', onDown)
    const ro = new ResizeObserver(() => {
      pool?.resize()
      place(layout(performance.now() / 1000))
    })
    ro.observe(stage)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      wake()
    })
    io.observe(stage)
    document.addEventListener('visibilitychange', wake)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      pool?.destroy()
      ro.disconnect()
      io.disconnect()
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [])

  return (
    <section id="night-swim" className="chapter swim">
      <div className="chapter-inner">
        <ChapterHead id="night-swim" tone="cool" />
        <AnimatedText text={NARRATION.nightSwim} className="story-narration story-narration-lg" />
      </div>
      <div ref={stageRef} className={`pool ${gl ? 'is-gl' : ''}`}>
        <canvas ref={canvasRef} className="pool-canvas" aria-hidden="true" />
        {POOL.map((p, i) => (
          <a
            key={p.slug}
            ref={(el) => {
              links.current[i] = el
            }}
            href={`#/gallery/${p.slug}`}
            className="pool-float"
          >
            <Picture src={p.src} sizes="(min-width: 700px) 22vw, 40vw" develop={false} className="pool-photo" />
            <span className="pool-label">{THEMES.find((t) => t.slug === p.slug)?.title}</span>
          </a>
        ))}
        <p className="pool-hint" aria-hidden="true">
          Move to make ripples · tap a photograph to dive in
        </p>
      </div>
    </section>
  )
}
