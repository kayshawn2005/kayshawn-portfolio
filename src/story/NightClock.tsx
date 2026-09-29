import { useEffect, useState } from 'react'
import { clamp01, onScrollFrame } from '../lib/scroll'
import { CHAPTERS } from '../data/story'

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Which chapter is on screen, and the story's clock time — interpolated between chapter times as you scroll. */
function useStoryClock() {
  const [state, setState] = useState({ index: 0, time: CHAPTERS[0].time })
  useEffect(
    () =>
      onScrollFrame(() => {
        const line = window.innerHeight * 0.45
        const tops = CHAPTERS.map((c) => document.getElementById(c.id)?.getBoundingClientRect().top ?? Infinity)
        let i = 0
        while (i < tops.length - 1 && tops[i + 1] <= line) i++
        const next = tops[i + 1]
        const frac = next !== undefined && Number.isFinite(next) ? clamp01((line - tops[i]) / (next - tops[i])) : 0
        const m0 = minutes(CHAPTERS[i].time)
        const m1 = i + 1 < CHAPTERS.length ? minutes(CHAPTERS[i + 1].time) : m0 + 10
        const m = Math.round(m0 + (m1 - m0) * frac)
        const time = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
        setState((s) => (s.index === i && s.time === time ? s : { index: i, time }))
      }),
    [],
  )
  return state
}

/** The night's clock on the right edge: the time, and one stop per chapter (each is a link). */
export function NightClock() {
  const { index, time } = useStoryClock()
  return (
    <nav className="night-clock" aria-label="Chapters">
      <p className="night-clock-time">{time}</p>
      <ol>
        {CHAPTERS.map((c, i) => (
          <li key={c.id} className={i === index ? 'is-now' : i < index ? 'is-past' : ''}>
            <a href={`#${c.id}`} aria-current={i === index ? 'step' : undefined}>
              <span className="night-clock-dot" aria-hidden="true" />
              <span className="night-clock-label">{c.id === 'prologue' || c.id === 'epilogue' ? c.numeral : `${c.numeral} · ${c.title}`}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
