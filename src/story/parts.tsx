import type { ReactNode } from 'react'
import { ArrowDown } from '@phosphor-icons/react'
import type { Chapter } from '../data/story'
import { scrollToId, useSeen } from './hooks'

/** A chapter's title card, as in a film: the title in the frame, the narration as a subtitle at the foot of it. */
export function ChapterCard({ chapter, line }: { chapter: Chapter; line: string }) {
  const [ref, seen] = useSeen<HTMLDivElement>(0.5)
  return (
    <div ref={ref} className={`chapter-card ${seen ? 'is-seen' : ''}`}>
      <div className="title-card">
        <p className="chapter-meta">
          <span>{chapter.numeral}</span>
          <span>{chapter.time}</span>
        </p>
        <h2 className="chapter-title">{chapter.title}</h2>
      </div>
      <p className="subtitle">{line}</p>
    </div>
  )
}

/** The way on to the next scene. */
export function NextButton({ to, children }: { to: string; children: ReactNode }) {
  return (
    <div className="next">
      <button type="button" className="button is-ghost" onClick={() => scrollToId(to)}>
        {children}
        <ArrowDown size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
}
