import { useState, type CSSProperties } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { Picture } from '../components/Picture'
import { PHOTOS } from '../data/photos.gen'
import { SERIES } from '../data/content'
import { photoName } from '../lib/photos'
import { Lightbox, type LightboxState } from './Lightbox'

const ratio = (src: string) => {
  const m = PHOTOS[photoName(src) ?? '']
  return m ? m.w / m.h : 0.8
}

/** Every series, newest first. Photographs keep their own shape; tap one to see it full screen. */
export function AlbumPage() {
  const [box, setBox] = useState<LightboxState | null>(null)
  const frames = SERIES.reduce((n, s) => n + s.images.length, 0)
  return (
    <main className="album">
      <header className="album-head">
        <h1 className="album-title">The Album</h1>
        <p className="album-sub">
          {SERIES.length} series, {frames} photographs.
        </p>
        <nav className="album-index" aria-label="Series">
          {SERIES.map((s) => (
            <a key={s.slug} href={`#/album/${s.slug}`}>
              {s.title}
            </a>
          ))}
        </nav>
      </header>
      {SERIES.map((s) => (
        <section key={s.slug} id={s.slug} className="album-series">
          <div className="album-series-head">
            <h2>
              {s.title}
              {s.isNew && <span className="badge">New</span>}
            </h2>
            <p>{s.mood}</p>
          </div>
          <div className="album-grid">
            {s.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="album-cell"
                style={{ '--r': ratio(src) } as CSSProperties}
                onClick={() => setBox({ images: s.images, index: i, title: s.title })}
                aria-label={`Open ${s.title}, photograph ${i + 1}`}
              >
                <Picture src={src} alt="" sizes="(min-width: 1100px) 520px, (min-width: 700px) 45vw, 92vw" className="album-photo" />
              </button>
            ))}
          </div>
        </section>
      ))}
      <footer className="album-foot">
        <a className="button is-ghost" href="#/">
          <ArrowLeft size={16} weight="bold" aria-hidden="true" />
          Back to the story
        </a>
        <p>&copy; 2026 Kayshawn Yen</p>
      </footer>
      {box && <Lightbox state={box} onChange={(index) => setBox({ ...box, index })} onClose={() => setBox(null)} />}
    </main>
  )
}
