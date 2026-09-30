import { Picture } from '../components/Picture'
import { SERIES } from '../data/content'
import { CHAPTERS, LESSON, LINES } from '../data/story'
import { ChapterCard, NextButton } from './parts'

/**
 * Chapter II: night school. The chalkboard holds the lesson (how a shoot comes together) and every desk holds a
 * series: the index of all the work, each one opening in the album.
 */
export function Classroom() {
  return (
    <section id="classroom" data-plate="classroom" className="chapter">
      <ChapterCard chapter={CHAPTERS[2]} line={LINES.classroom} />
      <div className="chapter-body">
        <article className="chalkboard">
          <h3 className="chalk-title">Today&apos;s lesson: how a shoot comes together</h3>
          <ol className="lesson">
            {LESSON.map(([step, text]) => (
              <li key={step}>
                <span className="lesson-step">{step}</span>
                <span className="lesson-text">{text}</span>
              </li>
            ))}
          </ol>
        </article>
        <article className="desks" id="series">
          <h3 className="section-title on-set">Every desk holds a series</h3>
          <ul className="desk-grid">
            {SERIES.map((s) => (
              <li key={s.slug}>
                <a className="desk" href={`#/album/${s.slug}`}>
                  <span className="desk-print">
                    <Picture src={s.images[0]} alt={s.title} sizes="(min-width: 1100px) 320px, (min-width: 700px) 30vw, 45vw" className="desk-photo" />
                  </span>
                  <span className="desk-title on-set">
                    {s.title}
                    {s.isNew && <span className="badge">New</span>}
                  </span>
                  <span className="desk-count on-set">{s.images.length} photographs</span>
                </a>
              </li>
            ))}
          </ul>
        </article>
        <NextButton to="pool">Go out to the pool</NextButton>
      </div>
    </section>
  )
}
