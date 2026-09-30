import { ArrowCounterClockwise, ArrowUpRight, Copy, Check } from '@phosphor-icons/react'
import { useState } from 'react'
import { Picture } from '../components/Picture'
import { CONTACT, seriesBySlug } from '../data/content'
import { CHAPTERS, CREDITS, LINES } from '../data/story'
import { PHOTOS } from '../data/photos.gen'
import { photoName } from '../lib/photos'
import { prefersReducedMotion } from '../lib/motion'
import { ChapterCard } from './parts'

const ratioOf = (src: string) => {
  const m = PHOTOS[photoName(src) ?? '']
  return m ? m.w / m.h : 1
}

/** The newest series, shown as the finale: its pinks and golds are the sunrise's. */
function RoseCastle() {
  const s = seriesBySlug('rose-castle')
  if (!s) return null
  return (
    <article className="finale" aria-labelledby="finale-title">
      <div className="finale-head">
        <span className="badge">New series</span>
        <h3 id="finale-title" className="finale-title">{s.title}</h3>
        <p className="finale-mood">{s.mood}</p>
      </div>
      {/* Two rows, each a landscape beside a portrait at the same height: every photograph keeps its own shape. */}
      <div className="finale-rows">
        {[
          [0, 1],
          [3, 2],
        ].map((row) => (
          <div key={row.join()} className="finale-row">
            {row.map((i) => {
              const src = s.images[i]
              const r = ratioOf(src)
              return (
                <a key={src} href={`#/album/${s.slug}`} className="finale-cell" style={{ flex: `${r} 1 0`, aspectRatio: r }}>
                  <Picture src={src} alt={`${s.title}, photograph ${i + 1}`} sizes={r > 1 ? '(min-width: 900px) 62vw, 92vw' : '(min-width: 900px) 22vw, 92vw'} className="finale-photo" />
                </a>
              )
            })}
          </div>
        ))}
      </div>
    </article>
  )
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard
      ?.writeText(CONTACT.email)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }
  return (
    <article className="panel contact" id="contact">
      <h3 className="contact-title">Let&apos;s make something.</h3>
      <dl className="contact-list">
        <div>
          <dt>Email</dt>
          <dd>
            <span className="selectable">{CONTACT.email}</span>
            <button type="button" className="icon-button" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer">
              {CONTACT.instagramHandle}
            </a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
          </dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>{CONTACT.location}</dd>
        </div>
      </dl>
      <a className="button is-solid" href={CONTACT.gmailComposeUrl} target="_blank" rel="noreferrer">
        Write to me
        <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
      </a>
    </article>
  )
}

/** Epilogue: dawn at the sea. The last series, the way to get in touch, and the credits. */
export function Sunrise() {
  const startOver = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
    window.setTimeout(() => window.dispatchEvent(new Event('story:restart')), prefersReducedMotion() ? 0 : 900)
  }
  return (
    <section id="sunrise" data-plate="sunrise" className="chapter sunrise">
      <ChapterCard chapter={CHAPTERS[4]} line={LINES.sunrise} />
      <div className="chapter-body">
        <RoseCastle />
        <Contact />
        <div className="panel credits">
          <p className="credits-title">Kayshawn Yen</p>
          <dl>
            {CREDITS.map(([role, who]) => (
              <div key={role}>
                <dt>{role}</dt>
                <dd>{who}</dd>
              </div>
            ))}
          </dl>
          <div className="credits-actions">
            <button type="button" className="button is-ghost" onClick={startOver}>
              <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
              Start over
            </button>
            <a className="button is-ghost" href="#/album">
              The whole album
              <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
            </a>
          </div>
          <p className="credits-fine">&copy; 2026 Kayshawn Yen</p>
        </div>
      </div>
    </section>
  )
}
