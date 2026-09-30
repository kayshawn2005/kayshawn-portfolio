import { useEffect, useRef, useState } from 'react'
import { createStage, type PlateLook } from '../engine/stage'
import { PLATES, type PlateId } from '../data/story'
import { clamp01, prefersReducedMotion } from '../lib/motion'
import { music } from '../lib/music'
import { director, scrollForSongTime } from './director'

interface Segment {
  id: PlateId
  look: PlateLook
  top: number
  bottom: number
}

/** Reduced motion: the same sets, held still, with no weather. */
const stillLook = (look: PlateLook): PlateLook => ({ ...look, cam: [look.cam[0], look.cam[0]], zoom: [look.zoom[0], look.zoom[0]], fx: {} })

/**
 * The fixed canvas behind the story. Every element with data-plate="<id>" claims the stretch of page it covers for
 * that set; the camera moves through a set as you scroll through its stretch, and neighbouring sets dissolve into
 * each other around the boundary. Without WebGL2 the sections show their stills as plain backgrounds instead.
 */
export function StoryStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const still = prefersReducedMotion()
    const stage = createStage(canvas)
    if (!stage) {
      setFallback(true)
      document.documentElement.classList.add('no-stage')
      return () => document.documentElement.classList.remove('no-stage')
    }

    let segs: Segment[] = []
    const measure = () => {
      const list: Segment[] = []
      document.querySelectorAll<HTMLElement>('[data-plate]').forEach((el) => {
        const id = el.dataset.plate as PlateId
        const r = el.getBoundingClientRect()
        const top = r.top + window.scrollY
        const last = list[list.length - 1]
        if (last && last.id === id) last.bottom = top + r.height
        else list.push({ id, look: still ? stillLook(PLATES[id]) : PLATES[id], top, bottom: top + r.height })
      })
      segs = list
    }
    measure()

    // Load the first set immediately, then the rest in story order.
    const ids = segs.map((s) => s.id)
    ;(async () => {
      for (const id of ids) await stage.load(PLATES[id]).catch(() => {})
    })()

    let raf = 0
    let alive = true
    const tick = (now: number) => {
      raf = 0
      if (!alive || document.hidden) return
      const vh = window.innerHeight
      // "Follow the music": ease the page toward where the song is.
      if (director.film && music.playing()) {
        const target = scrollForSongTime(music.time())
        const y = window.scrollY
        const next = y + (target - y) * 0.06
        if (Math.abs(next - y) > 0.5) window.scrollTo({ top: Math.round(next), behavior: 'instant' })
      }
      const center = window.scrollY + vh * 0.5
      if (segs.length) {
        let i = 0
        for (let k = 0; k < segs.length; k++) if (segs[k].top <= center) i = k
        const span = vh * 0.7
        const prog = (s: Segment) => clamp01((center - s.top) / Math.max(1, s.bottom - s.top))
        let a = segs[i]
        let b: Segment | null = null
        let mix = 0
        const next = segs[i + 1]
        const prev = segs[i - 1]
        if (next && center > next.top - span / 2) {
          b = next
          mix = (center - (next.top - span / 2)) / span
        } else if (prev && center < a.top + span / 2) {
          b = a
          a = prev
          mix = (center - (b.top - span / 2)) / span
        }
        let pa = prog(a)
        if (a.id === 'booth' && director.boothPush >= 0) pa = director.boothPush
        // warm up the neighbours
        if (b && !stage.ready(b.look)) void stage.load(b.look).catch(() => {})
        stage.render({ a: a.look, pa, b: b?.look ?? null, pb: b ? prog(b) : 0, mix, flash: director.flash, fade: 0 }, still ? 0 : now / 1000)
      }
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf && alive && !document.hidden) raf = requestAnimationFrame(tick)
    }
    wake()

    // Any hand on the page takes the scroll back from "follow the music".
    const takeBack = () => director.setFilm(false)
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) takeBack()
    }
    const onPoint = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') stage.point((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('wheel', takeBack, { passive: true })
    window.addEventListener('touchstart', takeBack, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onPoint, { passive: true })
    const ro = new ResizeObserver(() => {
      stage.resize()
      measure()
    })
    ro.observe(document.body)
    document.addEventListener('visibilitychange', wake)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('wheel', takeBack)
      window.removeEventListener('touchstart', takeBack)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onPoint)
      document.removeEventListener('visibilitychange', wake)
      stage.destroy()
    }
  }, [])

  return <canvas ref={canvasRef} className={`stage ${fallback ? 'is-off' : ''}`} aria-hidden="true" />
}
