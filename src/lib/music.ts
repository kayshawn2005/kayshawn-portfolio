/**
 * Site soundtrack: "in the pool" by Kensuke Ushio.
 * On by default: it starts the moment the browser allows sound (autoplay if permitted, otherwise the
 * phone booth's "pick up"), fades in over 2 s, remembers a visitor who mutes it, pauses in background
 * tabs, and exposes a beat clock the visuals sync to. Measured from the track: 102.08 BPM, first downbeat 1.943 s.
 */
export const BPM = 102.08
export const BEAT = 60 / BPM
export const DOWNBEAT = 1.943
export const TRACK = { title: 'in the pool', artist: 'Kensuke Ushio' }

/**
 * Where each chapter sits on the song (seconds), found from its loudness and brightness curve. 1:57 is the
 * near-silent break before the loudest stretch, which is where the story dives into the pool.
 */
export const SECTIONS = { booth: 0, cafe: 18.4, classroom: 58.4, pool: 100.7, dive: 117.2, climax: 124.2, sunrise: 180, end: 247.3 } as const

const SRC = '/audio/in-the-pool.m4a'
const STORE_KEY = 'ky-sound'
const VOLUME = 0.7

type Listener = () => void

class MusicEngine {
  on = false
  private el: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private gain: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private bins: Uint8Array<ArrayBuffer> = new Uint8Array(0)
  private readonly t0 = typeof performance !== 'undefined' ? performance.now() : 0
  private readonly listeners = new Set<Listener>()

  constructor() {
    if (typeof document === 'undefined') return
    document.addEventListener('visibilitychange', () => {
      if (!this.el || !this.on) return
      if (document.hidden) this.el.pause()
      else void this.el.play().catch(() => {})
    })
  }

  subscribe = (fn: Listener) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }
  getOn = () => this.on
  private emit() {
    this.listeners.forEach((fn) => fn())
  }

  /** Sound is on unless this visitor muted it on an earlier visit. */
  wantsSound() {
    try {
      return localStorage.getItem(STORE_KEY) !== 'off'
    } catch {
      return true
    }
  }
  private save(on: boolean) {
    try {
      localStorage.setItem(STORE_KEY, on ? 'on' : 'off')
    } catch {
      /* storage unavailable: preference just isn't remembered */
    }
  }

  private build() {
    const el = new Audio(SRC)
    el.loop = true
    el.preload = 'auto'
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const source = ctx.createMediaElementSource(el)
    const gain = ctx.createGain()
    gain.gain.value = 0
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.82
    source.connect(gain)
    gain.connect(analyser)
    analyser.connect(ctx.destination)
    this.el = el
    this.ctx = ctx
    this.gain = gain
    this.analyser = analyser
    this.bins = new Uint8Array(analyser.frequencyBinCount)
  }

  private ramp(to: number, seconds: number) {
    if (!this.ctx || !this.gain) return
    const g = this.gain.gain
    const now = this.ctx.currentTime
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(to, now + seconds)
  }

  /**
   * Starts with sound if the browser already permits it (no click needed). Resolves false when
   * autoplay is blocked — the usual first-visit case — leaving everything paused and silent.
   */
  async tryAutoplay() {
    if (this.on) return true
    if (!this.el) this.build()
    try {
      await this.el!.play()
      await Promise.race([this.ctx!.resume(), new Promise((r) => window.setTimeout(r, 300))])
      if (this.ctx!.state !== 'running') throw new Error('audio context suspended')
    } catch {
      this.el!.pause()
      this.el!.currentTime = 0
      return false
    }
    this.on = true
    this.emit()
    this.ramp(VOLUME, 2)
    return true
  }

  async enable() {
    if (!this.el) this.build()
    this.on = true
    this.save(true)
    this.emit()
    // play() first, inside the gesture (iOS), then resume the context
    const playing = this.el!.play()
    void this.ctx!.resume()
    try {
      await playing
    } catch {
      this.on = false
      this.emit()
      return
    }
    this.ramp(VOLUME, 2)
  }

  disable() {
    this.on = false
    this.save(false)
    this.emit()
    this.ramp(0, 0.6)
    const el = this.el
    window.setTimeout(() => {
      if (!this.on) el?.pause()
    }, 650)
  }

  toggle() {
    if (this.on) this.disable()
    else void this.enable()
  }

  /** Jump to a point in the song (used when "follow the music" starts from where the visitor already is). */
  seek(seconds: number) {
    if (this.el) this.el.currentTime = Math.max(0, seconds)
  }

  /** True while the track is audibly playing (the visual clock follows it). */
  playing() {
    return this.on && !!this.el && !this.el.paused
  }

  /** Seconds on the song's timeline while playing; a free-running clock otherwise. */
  time() {
    return this.playing() ? this.el!.currentTime : (performance.now() - this.t0) / 1000
  }

  /** 1 on each half-time beat, decaying — a slow "breath" at 65 BPM. */
  pulse() {
    const phase = ((((this.time() - DOWNBEAT) / (BEAT * 2)) % 1) + 1) % 1
    return Math.exp(-phase * 5)
  }

  /** n log-spaced frequency bands in 0..1 (all zero when silent). */
  bands(n: number) {
    const out = new Array<number>(n).fill(0)
    if (!this.analyser || !this.playing()) return out
    this.analyser.getByteFrequencyData(this.bins)
    const len = this.bins.length
    for (let b = 0; b < n; b++) {
      const lo = Math.floor(len ** (b / n)), hi = Math.max(lo + 1, Math.floor(len ** ((b + 1) / n)))
      let sum = 0
      for (let i = lo; i < hi; i++) sum += this.bins[i]
      out[b] = sum / (hi - lo) / 255
    }
    return out
  }
}

export const music = new MusicEngine()
