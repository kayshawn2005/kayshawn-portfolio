import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { TopNav } from './components/TopNav'
import { LightboxProvider } from './components/Lightbox'
import { Atmosphere } from './components/Atmosphere'
import { IntroGate } from './components/IntroGate'
import { prefersReducedMotion } from './components/FadeIn'
import { withViewTransition } from './lib/viewTransition'
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

const targetId = (route: Route) => (route.view === 'home' ? route.anchor : route.view === 'gallery' ? route.slug : null)

function scrollToRoute(route: Route, smooth: boolean) {
  const id = targetId(route)
  const el = id ? document.getElementById(id) : null
  const behavior: ScrollBehavior = smooth && !prefersReducedMotion() ? 'smooth' : 'instant'
  if (el) el.scrollIntoView({ behavior, block: 'start' })
  else window.scrollTo({ top: 0, behavior })
}

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const viewRef = useRef(parseHash(hash).view)

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash
      const route = parseHash(next)
      if (route.view === viewRef.current) {
        // Same page: glide to the section.
        setHash(next)
        requestAnimationFrame(() => scrollToRoute(route, true))
        return
      }
      // New page: an aperture transition, with the new page already at its scroll target when it opens.
      viewRef.current = route.view
      withViewTransition('page', () => {
        flushSync(() => setHash(next))
        scrollToRoute(route, false)
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Deep link on first load (e.g. #/gallery/sparks-and-steel).
  useEffect(() => {
    const route = parseHash(window.location.hash)
    if (targetId(route)) requestAnimationFrame(() => scrollToRoute(route, false))
  }, [])

  const route = parseHash(hash)

  return (
    <LightboxProvider>
      <TopNav />
      {route.view === 'gallery' && <GalleryPage />}
      {route.view === 'about' && <AboutPage />}
      {route.view === 'contact' && <ContactPage />}
      {route.view === 'home' && <HomePage />}
      <Atmosphere />
      <IntroGate />
    </LightboxProvider>
  )
}

export default App
