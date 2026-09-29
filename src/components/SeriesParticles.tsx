import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './FadeIn'
import { music } from '../lib/music'

export type ParticleKind = 'sakura' | 'petals' | 'sparks' | 'dust' | 'snow'

interface Particle { x: number; y: number; vx: number; vy: number; size: number; rot: number; spin: number; phase: number; hot: boolean }

// particles per 10,000 CSS px² of section
const DENSITY: Record<ParticleKind, number> = { sakura: 0.3, petals: 0.22, sparks: 0.45, dust: 0.55, snow: 0.8 }

/** A light layer of the series' own weather drifting over its photos: petals, sparks, dust or snow. */
export function SeriesParticles({ kind }: { kind: ParticleKind }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    let W = 0
    let H = 0
    let raf = 0
    let last = 0
    let visible = false
    let parts: Particle[] = []

    const spawn = (anywhere: boolean): Particle => {
      const p: Particle = { x: rand(0, W), y: anywhere ? rand(0, H) : -12, vx: 0, vy: 0, size: 0, rot: rand(0, 6.28), spin: rand(-1.4, 1.4), phase: rand(0, 6.28), hot: false }
      switch (kind) {
        case 'sakura':
        case 'petals':
          p.vx = rand(-8, 26); p.vy = rand(26, 52); p.size = rand(4.5, 9)
          break
        case 'snow':
          p.size = rand(0.8, 2.8); p.vy = 14 + p.size * 14; p.vx = rand(-6, 6)
          break
        case 'dust':
          p.vx = rand(-5, 5); p.vy = rand(-7, 3); p.size = rand(0.7, 2.1)
          break
        case 'sparks':
          p.hot = Math.random() < 0.28 // a few fast sparks falling from the blade, the rest drifting embers
          if (p.hot) { p.x = rand(W * 0.35, W); p.vx = rand(-160, -40); p.vy = rand(40, 120); p.size = rand(1, 1.8) }
          else { p.y = anywhere ? rand(0, H) : H + 8; p.vx = rand(-14, 14); p.vy = rand(-70, -28); p.size = rand(0.8, 1.8) }
          break
      }
      return p
    }

    const resize = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      const n = Math.min(160, Math.round((W * H * DENSITY[kind]) / 10000))
      parts = Array.from({ length: n }, () => spawn(true))
    }

    const draw = (p: Particle, t: number, glow: number) => {
      switch (kind) {
        case 'sakura':
        case 'petals': {
          const flip = Math.cos(p.phase + t * 1.8)
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.scale(0.25 + 0.75 * Math.abs(flip), 1)
          const s = p.size
          ctx.beginPath()
          ctx.moveTo(0, -s)
          ctx.bezierCurveTo(s * 0.9, -s * 0.75, s * 0.75, s * 0.55, 0, s)
          ctx.bezierCurveTo(-s * 0.75, s * 0.55, -s * 0.9, -s * 0.75, 0, -s)
          ctx.fillStyle = kind === 'sakura' ? `hsla(${flip > 0 ? 344 : 350}, 88%, ${flip > 0 ? 88 : 80}%, ${0.82 * glow})` : `hsla(36, 60%, ${flip > 0 ? 95 : 88}%, ${0.75 * glow})`
          ctx.fill()
          ctx.restore()
          break
        }
        case 'snow':
          ctx.globalAlpha = Math.min(1, (0.35 + p.size * 0.22) * glow)
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
          break
        case 'dust': {
          const a = (0.35 + 0.35 * Math.sin(t * 2.2 + p.phase)) * glow
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
          g.addColorStop(0, `rgba(255,222,160,${a})`)
          g.addColorStop(1, 'rgba(255,200,120,0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6)
          break
        }
        case 'sparks': {
          const flicker = 0.55 + 0.45 * Math.sin(t * 17 + p.phase)
          ctx.globalCompositeOperation = 'lighter'
          ctx.strokeStyle = `rgba(255,${p.hot ? 196 : 150},${p.hot ? 110 : 60},${(p.hot ? 0.95 : 0.7) * flicker * glow})`
          ctx.lineWidth = p.size
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * (p.hot ? 0.06 : 0.1), p.y - p.vy * (p.hot ? 0.06 : 0.1))
          ctx.stroke()
          ctx.globalCompositeOperation = 'source-over'
          break
        }
      }
    }

    const tick = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
      last = now
      const t = now / 1000
      const glow = music.playing() ? 0.85 + 0.3 * music.pulse() : 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]
        if (kind === 'sakura' || kind === 'petals' || kind === 'snow') p.x += Math.sin(t * 1.1 + p.phase) * 14 * dt
        if (kind === 'dust') { p.vx += rand(-4, 4) * dt; p.vy += rand(-4, 4) * dt }
        if (kind === 'sparks' && p.hot) p.vy += 260 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt
        if (p.y > H + 16 || p.y < -20 || p.x < -24 || p.x > W + 24) parts[i] = spawn(false)
        draw(p, t, glow)
      }
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf && visible && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    const ro = new ResizeObserver(resize)
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
  }, [kind])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 w-full h-full z-10" aria-hidden="true" />
}
