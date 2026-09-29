import { CHAPTERS } from '../data/story'

/** Chapter title card: numeral, name, and the time on the night's clock. */
export function ChapterHead({ id, tone = 'steel' }: { id: string; tone?: 'steel' | 'warm' | 'cool' }) {
  const c = CHAPTERS.find((ch) => ch.id === id)
  if (!c) return null
  return (
    <header className="chapter-head">
      <span className="chapter-numeral">{c.numeral}</span>
      <h2 className={`chapter-title tone-${tone}`}>{c.title}</h2>
      <span className="chapter-time">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 4.5V8l2.4 1.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {c.time}
      </span>
    </header>
  )
}
