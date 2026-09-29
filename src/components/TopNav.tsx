import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SoundToggle } from './SoundToggle'

const LINKS = [
  { href: '#/about', label: 'About' },
  { href: '#/gallery', label: 'Gallery' },
  { href: '#projects', label: 'Projects' },
  { href: '#/contact', label: 'Contact' },
]

/** Fixed top nav — persists across every page. On phones the links fold into a full-screen menu. */
export function TopNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onHash = () => setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="site-nav fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0C0C0C]/80 border-b border-white/10">
        <div className="flex justify-between items-center gap-4 px-5 md:px-10 py-4 md:py-5 max-w-6xl mx-auto">
          <a href="#/" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-base whitespace-nowrap hover:opacity-70 transition-opacity duration-200">
            Kayshawn Yen
          </a>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <nav className="hidden sm:flex gap-6 md:gap-8" aria-label="Main">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm hover:opacity-70 transition-opacity duration-200">
                  {l.label}
                </a>
              ))}
            </nav>
            <SoundToggle />
            <button
              type="button"
              className="sm:hidden menu-button"
              aria-expanded={open}
              aria-controls="mobile-menu"
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
          <nav id="mobile-menu" className="mobile-menu" aria-label="Main">
            {LINKS.map((l, i) => (
              <a key={l.href} href={l.href} style={{ animationDelay: `${0.05 + i * 0.06}s` }} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>,
          document.body,
        )}
    </>
  )
}
