/**
 * Shared, mutable state between the story's DOM (React) and the render loop, kept outside React so the loop never
 * causes re-renders. React components write intents here; the stage loop reads them every frame.
 */
import { SECTIONS, music } from '../lib/music'
import { clamp01 } from '../lib/motion'

type Listener = () => void

export const director = {
  /** White-out while the phone is picked up (0..1). */
  flash: 0,
  /** While >= 0, overrides the booth's camera progress (the push into the booth on pick-up). */
  boothPush: -1,
  /** "Follow the music": the page scrolls itself in time with the song. */
  film: false,
  listeners: new Set<Listener>(),
  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  },
  setFilm(on: boolean) {
    if (this.film === on) return
    this.film = on
    this.listeners.forEach((fn) => fn())
  },
}

/** Anchor ids on the page, paired with where they start on the song. */
const CUES: [string, number][] = [
  ['booth', SECTIONS.booth],
  ['cafe', SECTIONS.cafe],
  ['classroom', SECTIONS.classroom],
  ['pool', SECTIONS.pool],
  ['dive', SECTIONS.dive],
  ['sunrise', SECTIONS.sunrise],
]

const top = (id: string) => {
  const el = document.getElementById(id)
  return el ? el.getBoundingClientRect().top + window.scrollY : 0
}

/** Where the page should be for a moment in the song: linear between chapter starts, ending at the credits. */
export function scrollForSongTime(t: number) {
  const end = document.documentElement.scrollHeight - window.innerHeight
  const points = CUES.map(([id, at]) => [at, Math.min(end, top(id))] as const)
  points.push([SECTIONS.end, end])
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, y0] = points[i]
    const [t1, y1] = points[i + 1]
    if (t < t1) return y0 + (y1 - y0) * clamp01((t - t0) / (t1 - t0))
  }
  return end
}

/** The inverse: the moment in the song that belongs to a scroll position. */
export function songTimeForScroll(y: number) {
  const end = document.documentElement.scrollHeight - window.innerHeight
  const points = CUES.map(([id, at]) => [at, Math.min(end, top(id))] as const)
  points.push([SECTIONS.end, end])
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, y0] = points[i]
    const [t1, y1] = points[i + 1]
    if (y < y1) return t0 + (t1 - t0) * clamp01((y - y0) / Math.max(1, y1 - y0))
  }
  return SECTIONS.end - 1
}

/** The chapter the song is in right now (for the "the music has moved on" nudge). */
export function songChapter(): string {
  const t = music.time()
  let id = CUES[0][0]
  for (const [cue, at] of CUES) if (t >= at) id = cue
  return id === 'dive' ? 'pool' : id
}
