/**
 * Festival fireworks on a transparent canvas: rockets climb under gravity to where they were aimed and
 * burst into peony, ring or willow shells; "bloom" throws flower petals instead of sparks.
 * The canvas is cleared every frame and each trail is drawn from the spark's own recent path. Fading an
 * accumulated canvas instead would leave 8-bit rounding residue (grey ghosts that never clear), worst on 120 Hz screens.
 */
export type Shell = 'peony' | 'ring' | 'willow' | 'bloom'

/** Recent positions as flat [x, y, t] triplets, oldest first. */
type Trail = number[]

interface Rocket { x: number; y: number; vx: number; vy: number; shell: Shell; color: string; trail: Trail }
interface Spark {
  x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string; size: number
  gravity: number; drag: number; kind: 'spark' | 'petal' | 'flash'; rot: number; spin: number
  trail: Trail; span: number; twinkle: boolean; glow: number
}

export interface Fireworks {
  launch(x: number, y: number, shell?: Shell): void
  burst(x: number, y: number, shell: Shell, color?: string): void
  frame(dt: number): void
  resize(): void
}

const COLORS = ['#FF5FA2', '#FFC36B', '#8BE9FF', '#FFFFFF', '#C58BFF', '#FF8A4C']
const PETALS = ['#FFFFFF', '#FFE6EF', '#FFD3E4', '#FFF4DA']
const WILLOW = '#FFC36B'
const ROCKET = '#FFE3B8'
const GRAVITY = 900
/** Seconds of path each trail keeps. */
const SPAN = { rocket: 0.18, peony: 0.12, ring: 0.1, willow: 0.5 }
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

/** "r,g,b" for a hex color, for building rgba() stops. */
const RGB = new Map<string, string>()
const rgb = (hex: string) => {
  let c = RGB.get(hex)
  if (!c) {
    const n = parseInt(hex.slice(1), 16)
    c = `${n >> 16},${(n >> 8) & 255},${n & 255}`
    RGB.set(hex, c)
  }
  return c
}
/** The same color at zero alpha, so gradients fade out without darkening toward black. */
const CLEAR = new Map<string, string>()
const clearOf = (hex: string) => {
  let c = CLEAR.get(hex)
  if (!c) {
    c = `rgba(${rgb(hex)},0)`
    CLEAR.set(hex, c)
  }
  return c
}

function record(trail: Trail, x: number, y: number, now: number, span: number) {
  trail.push(x, y, now)
  let cut = 0
  while (cut < trail.length - 6 && now - trail[cut + 2] > span) cut += 3
  if (cut) trail.splice(0, cut)
}

export function createFireworks(canvas: HTMLCanvasElement): Fireworks | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  let W = 0
  let H = 0
  let dpr = 1
  let clock = 0
  let blank = true
  const rockets: Rocket[] = []
  const sparks: Spark[] = []

  /** A stroke along the recorded path, fading from clear at the tail to full color at the head. */
  const streak = (trail: Trail, x: number, y: number, vx: number, vy: number, color: string, width: number, alpha: number) => {
    let x0 = trail[0]
    let y0 = trail[1]
    if (Math.hypot(x - x0, y - y0) < 1.5) {
      x0 = x - vx * 0.03
      y0 = y - vy * 0.03
    }
    const g = ctx.createLinearGradient(x0, y0, x, y)
    g.addColorStop(0, clearOf(color))
    g.addColorStop(1, color)
    ctx.globalAlpha = alpha
    ctx.strokeStyle = g
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    for (let i = 3; i < trail.length; i += 3) ctx.lineTo(trail[i], trail[i + 1])
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const burst = (x: number, y: number, shell: Shell, color = pick(COLORS)) => {
    const base = { life: 1, rot: 0, spin: 0, span: 0, twinkle: false, glow: 0 }
    if (shell === 'bloom') {
      // A fountain: petals are thrown up and out, then drift down slowly.
      for (let i = 0; i < 110; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = rand(120, 460)
        sparks.push({ ...base, trail: [], x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 150, decay: rand(0.22, 0.38), color: pick(PETALS), size: rand(4, 8), gravity: 60, drag: 0.97, kind: 'petal', rot: rand(0, 6.28), spin: rand(-5, 5) })
      }
    } else {
      const n = shell === 'ring' ? 64 : shell === 'willow' ? 80 : 96
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (shell === 'ring' ? 0 : rand(-0.06, 0.06))
        const sp = shell === 'ring' ? 265 : rand(0.35, 1) * (shell === 'willow' ? 225 : 335)
        sparks.push({
          ...base, trail: [], x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          decay: shell === 'willow' ? rand(0.32, 0.46) : rand(0.7, 1.1),
          color: shell === 'willow' ? WILLOW : Math.random() < 0.15 ? '#FFFFFF' : color,
          size: shell === 'willow' ? 1.6 : 2.1, gravity: shell === 'willow' ? 130 : 220, drag: 0.98, kind: 'spark',
          span: SPAN[shell], twinkle: shell === 'peony' && Math.random() < 0.5,
        })
      }
    }
    // A white-hot core, then the shell's color washing over the sky for a moment.
    const flash = (hue: string, size: number, glow: number, decay: number) =>
      sparks.push({ ...base, trail: [], x, y, vx: 0, vy: 0, decay, color: hue, size, gravity: 0, drag: 1, kind: 'flash', glow })
    flash('#FFF0DC', shell === 'bloom' ? 90 : 60, 0.5, 6)
    flash(shell === 'willow' ? WILLOW : shell === 'bloom' ? '#FFD3E4' : color, shell === 'bloom' ? 360 : 280, 0.12, 1.3)
  }

  return {
    resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      blank = true
    },
    launch(tx, ty, shell) {
      const x0 = tx + rand(-40, 40)
      const vy = -Math.sqrt(2 * GRAVITY * Math.max(80, H - ty))
      const time = -vy / GRAVITY
      rockets.push({ x: x0, y: H + 8, vx: (tx - x0) / time, vy, shell: shell ?? pick<Shell>(['peony', 'peony', 'ring', 'willow']), color: pick(COLORS), trail: [] })
    },
    burst,
    frame(dt) {
      clock += dt
      if (!rockets.length && !sparks.length) {
        if (!blank) {
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          blank = true
        }
        return
      }
      blank = false
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        record(r.trail, r.x, r.y, clock, SPAN.rocket)
        r.vy += GRAVITY * dt
        r.x += r.vx * dt
        r.y += r.vy * dt
        streak(r.trail, r.x, r.y, r.vx, r.vy, ROCKET, 2, 0.9)
        if (r.vy >= -30) {
          rockets.splice(i, 1)
          burst(r.x, r.y, r.shell, r.color)
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        if (s.kind === 'spark') record(s.trail, s.x, s.y, clock, s.span)
        const k = Math.pow(s.drag, dt * 60)
        s.vx *= k
        s.vy = s.vy * k + s.gravity * dt
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.rot += s.spin * dt
        s.life -= s.decay * dt
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        if (s.kind === 'flash') {
          const c = rgb(s.color)
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size)
          g.addColorStop(0, `rgba(${c},1)`)
          g.addColorStop(0.25, `rgba(${c},0.32)`)
          g.addColorStop(1, `rgba(${c},0)`)
          ctx.globalAlpha = s.glow * s.life * s.life
          ctx.fillStyle = g
          ctx.fillRect(s.x - s.size, s.y - s.size, s.size * 2, s.size * 2)
        } else if (s.kind === 'petal') {
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = Math.min(1, s.life * 1.6)
          ctx.fillStyle = s.color
          ctx.save()
          ctx.translate(s.x, s.y)
          ctx.rotate(s.rot)
          ctx.scale(0.35 + 0.65 * Math.abs(Math.cos(s.rot * 1.7)), 1)
          ctx.beginPath()
          ctx.ellipse(0, 0, s.size * 0.5, s.size, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          ctx.globalCompositeOperation = 'lighter'
        } else {
          // Peony embers crackle as they die out.
          const flicker = s.twinkle && s.life < 0.35 ? 0.35 + Math.random() * 0.65 : 1
          streak(s.trail, s.x, s.y, s.vx, s.vy, s.color, s.size * (0.45 + 0.55 * s.life), Math.min(1, s.life * 1.25) * flicker)
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}
