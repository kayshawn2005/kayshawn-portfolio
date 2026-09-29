import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../components/FadeIn'

interface Drop { x: number; y: number; len: number; speed: number; alpha: number }
interface Ring { x: number; y: number; r: number; life: number }

/**
 * Night rain: slanted streaks falling past the camera, plus ripple rings on the wet street.
 * `intensity` (0–1) is eased toward, so the rain can taper off when the phone is picked up.
 */
export function Rain({ intensity, className = '' }: { intensity: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const target = useRef(intensity)
  useEffect(() => {
    target.current = intensity
  }, [intensity])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const WIND = -0.16
    let W = 0
    let H = 0
    let drops: Drop[] = []
    let rings: Ring[] = []
    let level = target.current
    let raf = 0
    let last = 0
    let visible = false

    const spawn = (anywhere: boolean): Drop => {
      const near = Math.random()
      return { x: rand(-0.1 * W, 1.15 * W), y: anywhere ? rand(-H, H) : rand(-120, -20), len: 10 + near * 28, speed: 700 + near * 900, alpha: 0.12 + near * 0.35 }
    }
    const resize = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      drops = Array.from({ length: Math.round(Math.min(420, (W * H) / 3200)) }, () => spawn(true))
    }
    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const active = Math.round(drops.length * level)
      ctx.lineCap = 'round'
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        d.y += d.speed * dt
        d.x += WIND * d.speed * dt
        if (d.y - d.len > H) {
          if (i < active && d.x > 0 && d.x < W && Math.random() < 0.35) rings.push({ x: d.x, y: rand(H * 0.8, H), r: 0, life: 1 })
          drops[i] = spawn(false)
        }
        if (i >= active) continue
        ctx.strokeStyle = `rgba(190,210,240,${d.alpha})`
        ctx.lineWidth = d.len > 26 ? 1.4 : 1
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - WIND * d.len, d.y - d.len)
        ctx.stroke()
      }
      ctx.lineWidth = 1
      rings = rings.filter((r) => (r.life -= dt * 1.6) > 0)
      for (const r of rings) {
        r.r += dt * 26
        ctx.strokeStyle = `rgba(190,210,240,${0.3 * r.life})`
        ctx.beginPath()
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    const tick = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
      last = now
      level += (target.current - level) * Math.min(1, dt * 0.9)
      draw(dt)
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (prefersReducedMotion()) return draw(0) // a single still frame of rain
      if (!raf && visible && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const ro = new ResizeObserver(() => {
      resize()
      wake()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      wake()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', wake)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', wake)
    }
  }, [])

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />
}
