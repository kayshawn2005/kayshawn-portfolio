import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { CHAPTERS } from '../data/story'
import { music } from '../lib/music'
import { clamp01 } from '../lib/motion'
import { director, songChapter } from './director'
import { scrollToId } from './hooks'

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h < 12 ? h + 24 : h) * 60 + m // the night runs past midnight
}
const hhmm = (mins: number) => {
  const m = Math.round(mins) % (24 * 60)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/**
 * The guide in the corner: the night's clock (19:40 at the phone booth, dawn at the sea) with the chapter you are in,
 * and a nudge when the music has moved on to the next chapter while you are still looking around.
 */
export function Guide() {
  const timeRef = useRef<HTMLSpanElement | null>(null)
  const [chapter, setChapter] = useState(0)
  const [nudge, setNudge] = useState<number | null>(null)

  useEffect(() => {
    let raf = 0
    let last = ''
    let lastChapter = -1
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const center = window.scrollY + window.innerHeight * 0.5
      const tops = CHAPTERS.map((c) => {
        const el = document.getElementById(c.id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      })
      let i = 0
      tops.forEach((t, k) => {
        if (t <= center) i = k
      })
      const nextTop = i + 1 < tops.length ? tops[i + 1] : document.documentElement.scrollHeight
      const f = clamp01((center - tops[i]) / Math.max(1, nextTop - tops[i]))
      const from = minutes(CHAPTERS[i].time)
      const to = i + 1 < CHAPTERS.length ? minutes(CHAPTERS[i + 1].time) : from + 20
      const text = hhmm(from + (to - from) * f)
      if (text !== last && timeRef.current) {
        timeRef.current.textContent = text
        last = text
      }
      if (i !== lastChapter) {
        lastChapter = i
        setChapter(i)
      }
    }
    raf = requestAnimationFrame(tick)

    const check = window.setInterval(() => {
      if (!music.playing() || director.film) return setNudge(null)
      const want = CHAPTERS.findIndex((c) => c.id === songChapter())
      setNudge(want > lastChapter ? want : null)
    }, 1000)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(check)
    }
  }, [])

  const c = CHAPTERS[chapter]
  return (
    <aside className={`guide ${chapter === 0 ? 'is-hidden' : ''}`} aria-label="Where you are in the story">
      <p className="guide-clock">
        <span ref={timeRef} className="guide-time">
          {c.time}
        </span>
        <span className="guide-chapter">
          {c.numeral === 'Prologue' || c.numeral === 'Epilogue' ? c.title : `${c.numeral}. ${c.title}`}
        </span>
      </p>
      {nudge !== null && (
        <button type="button" className="guide-nudge" onClick={() => scrollToId(CHAPTERS[nudge].id)}>
          The music has moved on to {CHAPTERS[nudge].title}
          <ArrowRight size={14} weight="bold" aria-hidden="true" />
        </button>
      )}
    </aside>
  )
}
