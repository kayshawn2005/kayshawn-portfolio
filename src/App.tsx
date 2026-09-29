import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { TopNav } from './components/TopNav'
import { LightboxProvider } from './components/Lightbox'
import { prefersReducedMotion } from './components/FadeIn'
import { withViewTransition } from './lib/viewTransition'
import { StoryPage } from './pages/Story'
import { AboutPage } from './pages/About'
import { GalleryPage, type World } from './pages/Gallery'
import { ContactPage } from './pages/Contact'

type Route =
  | { view: 'home'; anchor: string | null }
  | { view: 'gallery'; slug: string | null; world: World | null }
  | { view: 'about' }
  | { view: 'contact' }

function parseHash(hash: string): Route {
  if (hash.startsWith('#/gallery')) {
    const m = hash.match(/^#\/gallery\/(.+)$/)
    const part = m ? decodeURIComponent(m[1]) : null
    if (part === 'country' || part === 'city') return { view: 'gallery', slug: null, world: part }
    return { view: 'gallery', slug: part, world: null }
  }
  if (hash === '#/about') return { view: 'about' }
  if (hash === '#/contact') return { view: 'contact' }
  return { view: 'home', anchor: hash.length > 1 && !hash.startsWith('#/') ? hash.slice(1) : null }
}

const targetId = (route: Route) => (route.view === 'home' ? route.anchor : route.view === 'gallery' ? route.slug : null)
const pageKey = (route: Route) => (route.view === 'gallery' ? `gallery:${route.world ?? 'all'}` : route.view)

function scrollToRoute(route: Route, smooth: boolean) {
  const id = targetId(route)
  const el = id ? document.getElementById(id) : null
  const behavior: ScrollBehavior = smooth && !prefersReducedMotion() ? 'smooth' : 'instant'
  if (el) el.scrollIntoView({ behavior, block: 'start' })
  else window.scrollTo({ top: 0, behavior })
}

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const pageRef = useRef(pageKey(parseHash(hash)))

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash
      const route = parseHash(next)
      if (pageKey(route) === pageRef.current) {
        // Same page: glide to the section.
        setHash(next)
        requestAnimationFrame(() => scrollToRoute(route, true))
        return
      }
      // New page: an aperture transition, with the new page already at its scroll target when it opens.
      pageRef.current = pageKey(route)
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
      {route.view === 'gallery' && <GalleryPage world={route.world} />}
      {route.view === 'about' && <AboutPage />}
      {route.view === 'contact' && <ContactPage />}
      {route.view === 'home' && <StoryPage />}
      <div className="grain" aria-hidden="true" />
    </LightboxProvider>
  )
}

export default App
