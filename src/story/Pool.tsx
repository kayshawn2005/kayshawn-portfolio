import { useEffect, useRef, useState } from 'react'
import { Picture } from '../components/Picture'
import { createPool, type Float, type Pool } from '../engine/pool'
import { seriesBySlug } from '../data/content'
import { CHAPTERS, LINES, POOL, UNDERWATER } from '../data/story'
import { music, BEAT, DOWNBEAT } from '../lib/music'
import { sizedSrc } from '../lib/photos'
import { clamp01, prefersReducedMotion } from '../lib/motion'
import { ChapterCard, NextButton } from './parts'
import { useSeen } from './hooks'

// Phones: the floats zig-zag down a taller pool instead.
const NARROW_LAYOUT = [
  [0.3, 0.17],
  [0.7, 0.33],
  [0.3, 0.5],
  [0.7, 0.67],
  [0.32, 0.84],
]

/**
 * Looking down at the water: the featured series float on the pool. Ripples follow the pointer and a drop falls on
 * every other beat while the music plays. Each float is a real link laid over the canvas, so keyboards and screen
 * readers get the same way in; without WebGL2 the photographs simply float.
 */
function Water() {
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
      const bob = still ? 0 : 1
      return POOL.map((f, i) => {
        const [px, py] = narrow ? NARROW_LAYOUT[i] : [f.x, f.y]
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
    <div ref={stageRef} className={`water ${gl ? 'is-gl' : ''}`} data-plate="pool">
      <canvas ref={canvasRef} className="water-canvas" aria-hidden="true" />
      {POOL.map((p, i) => (
        <a
          key={p.slug}
          ref={(el) => {
            links.current[i] = el
          }}
          href={`#/album/${p.slug}`}
          className="float"
        >
          <Picture src={p.src} alt={seriesBySlug(p.slug)?.title ?? ''} sizes="(min-width: 700px) 22vw, 40vw" develop={false} className="float-photo" />
          <span className="float-label">{seriesBySlug(p.slug)?.title}</span>
        </a>
      ))}
      <p className="water-hint" aria-hidden="true">
        Move across the water to make ripples. Tap a photograph to open its series.
      </p>
    </div>
  )
}

/** One photograph under the water; it clears from a blur as it comes into view. */
function DeepFrame({ slug, src, i }: { slug: string; src: string; i: number }) {
  const [ref, seen] = useSeen<HTMLAnchorElement>(0.25)
  const s = seriesBySlug(slug)
  return (
    <a ref={ref} href={`#/album/${slug}`} className={`deep-frame is-${i} ${seen ? 'is-seen' : ''}`}>
      <Picture src={src} alt={s?.title ?? ''} sizes="(min-width: 900px) 42vw, 86vw" className="deep-photo" />
      <span className="deep-caption">
        <strong>{s?.title}</strong>
        {s?.mood}
      </span>
    </a>
  )
}

/** After the dive: three series, large, seen through the water. */
function Underwater() {
  return (
    <div className="deep">
      {UNDERWATER.map((u, i) => (
        <DeepFrame key={u.slug} slug={u.slug} src={u.src} i={i} />
      ))}
    </div>
  )
}

/** Chapter III: in the pool. The establishing shot, the water from above, then under it. */
export function PoolChapter() {
  return (
    <>
      <section id="pool" data-plate="pool" className="chapter">
        <ChapterCard chapter={CHAPTERS[3]} line={LINES.pool} />
        <Water />
      </section>
      <section id="dive" data-plate="underwater" className="chapter dive">
        <div className="dive-card">
          <p className="subtitle is-large">{LINES.dive}</p>
        </div>
        <Underwater />
        <NextButton to="sunrise">Swim up to the surface</NextButton>
      </section>
    </>
  )
}
