import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './FadeIn'
import { useMusicOn } from '../lib/useMusicOn'
import { music } from '../lib/music'

// Golden hour at the top of every page, blue hour by the bottom. Same stops as @keyframes grade in index.css.
const STOPS: [number, [number, number, number, number]][] = [
  [0, [255, 168, 92, 0.34]],
  [0.35, [255, 128, 96, 0.26]],
  [0.65, [120, 132, 210, 0.26]],
  [1, [52, 70, 160, 0.34]],
]
function gradeAt(p: number) {
  let i = 1
  while (i < STOPS.length - 1 && p > STOPS[i][0]) i++
  const [p0, a] = STOPS[i - 1]
  const [p1, b] = STOPS[i]
  const k = Math.min(1, Math.max(0, (p - p0) / (p1 - p0)))
  const c = a.map((v, j) => v + (b[j] - v) * k)
  return `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0} / ${c[3].toFixed(3)})`
}

/** Site-wide film grade + grain: one fixed soft-light layer over the page. */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement | null>(null)
  const on = useMusicOn()

  // Browsers without scroll-driven animations (e.g. Firefox today) get the same grade from JS.
  useEffect(() => {
    const el = ref.current
    if (!el || CSS.supports('animation-timeline: scroll()')) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.backgroundColor = gradeAt(max > 0 ? window.scrollY / max : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // With the soundtrack on, the light breathes on the half-beat.
  useEffect(() => {
    const el = ref.current
    if (!el || !on || prefersReducedMotion()) return
    let raf = 0
    const tick = () => {
      el.style.opacity = (0.8 + 0.2 * music.pulse()).toFixed(3)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      el.style.opacity = ''
    }
  }, [on])

  return <div ref={ref} className="atmosphere" aria-hidden="true" />
}
