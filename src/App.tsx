import { useEffect, useState } from 'react'
import { TopNav } from './components/TopNav'
import { LightboxProvider } from './components/Lightbox'
import { prefersReducedMotion } from './components/FadeIn'
import { HomePage } from './pages/Home'
import { AboutPage } from './pages/About'
import { GalleryPage } from './pages/Gallery'
import { ContactPage } from './pages/Contact'

type Route = { view: 'home'; anchor: string | null } | { view: 'gallery'; slug: string | null } | { view: 'about' } | { view: 'contact' }

function parseHash(hash: string): Route {
  if (hash.startsWith('#/gallery')) {
    const m = hash.match(/^#\/gallery\/(.+)$/)
    return { view: 'gallery', slug: m ? decodeURIComponent(m[1]) : null }
  }
  if (hash === '#/about') return { view: 'about' }
  if (hash === '#/contact') return { view: 'contact' }
  return { view: 'home', anchor: hash.length > 1 && !hash.startsWith('#/') ? hash.slice(1) : null }
}

function App() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const route = parseHash(hash)

  useEffect(() => {
    if (route.view === 'home') {
      const t = setTimeout(() => {
        if (route.anchor) {
          const el = document.getElementById(route.anchor)
          if (el) {
            el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
            return
          }
        }
        window.scrollTo(0, 0)
      }, 60)
      return () => clearTimeout(t)
    }
    // route.view is intentionally the dependency trigger; anchor is read from the same parse
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, route.view])

  return (
    <LightboxProvider>
      <TopNav />
      {route.view === 'gallery' && <GalleryPage slug={route.slug} />}
      {route.view === 'about' && <AboutPage />}
      {route.view === 'contact' && <ContactPage />}
      {route.view === 'home' && <HomePage />}
    </LightboxProvider>
  )
}

export default App
