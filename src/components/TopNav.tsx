import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SoundToggle } from './SoundToggle'
import { lockScroll } from '../lib/scrollLock'
import { CHAPTERS } from '../data/story'

const PAGES = [
  { href: '#/', label: 'Story' },
  { href: '#/gallery', label: 'Album' },
  { href: '#/about', label: 'About' },
  { href: '#/contact', label: 'Contact' },
]

/** Fixed top bar on every page. The menu is an index of the night: six scenes with their times, then the pages. */
export function TopNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const unlock = lockScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onHash = () => setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
    }
  }, [open])

  return (
    <>
      <header className="site-nav">
        <div className="site-nav-inner">
          <a href="#/" className="wordmark">
            Kayshawn Yen
          </a>
          <div className="site-nav-right">
            <nav className="hidden md:flex items-center gap-7" aria-label="Pages">
              {PAGES.map((p) => (
                <a key={p.href} href={p.href} className="site-nav-link">
                  {p.label}
                </a>
              ))}
            </nav>
            <SoundToggle />
            <button
              type="button"
              className="menu-button"
              aria-expanded={open}
              aria-controls="story-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      {open &&
        createPortal(
          <div id="story-menu" className="story-menu" role="dialog" aria-modal="true" aria-label="Menu">
            <nav className="story-menu-scenes" aria-label="Chapters">
              <p className="story-eyebrow">The night, in six scenes</p>
              <ol>
                {CHAPTERS.map((c, i) => (
                  <li key={c.id} style={{ animationDelay: `${0.04 + i * 0.05}s` }}>
                    <a href={`#${c.id}`}>
                      <span className="story-menu-time">{c.time}</span>
                      <span className="story-menu-num">{c.numeral}</span>
                      <span className="story-menu-title">{c.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <nav className="story-menu-pages" aria-label="Pages">
              <p className="story-eyebrow">Pages</p>
              <ul>
                {PAGES.map((p) => (
                  <li key={p.href}>
                    <a href={p.href}>{p.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </>
  )
}
