import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Header } from './components/Header'
import { AlbumPage } from './album/AlbumPage'
import { StoryPage } from './story/StoryPage'
import { withViewTransition } from './lib/viewTransition'

type Route = { page: 'story'; anchor: string | null } | { page: 'album'; slug: string | null }

function parse(hash: string): Route {
  // #/album/<slug>; the old #/gallery links still work
  const m = hash.match(/^#\/(album|gallery)(?:\/(.+))?$/)
  if (m) {
    const slug = m[2] ? decodeURIComponent(m[2]) : null
    return { page: 'album', slug: slug === 'country' || slug === 'city' ? null : slug }
  }
  if (hash === '#/about') return { page: 'story', anchor: 'about' }
  if (hash === '#/contact') return { page: 'story', anchor: 'contact' }
  return { page: 'story', anchor: hash.length > 1 && !hash.startsWith('#/') ? hash.slice(1) : null }
}

function scrollToRoute(route: Route) {
  const id = route.page === 'album' ? route.slug : route.anchor
  const el = id ? document.getElementById(id) : null
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

export default function App() {
  const [route, setRoute] = useState(() => parse(window.location.hash))

  useEffect(() => {
    const onHash = () => {
      const next = parse(window.location.hash)
      withViewTransition('page', () => {
        flushSync(() => setRoute(next))
        scrollToRoute(next)
      })
    }
    window.addEventListener('hashchange', onHash)
    requestAnimationFrame(() => scrollToRoute(parse(window.location.hash)))
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <Header page={route.page} />
      {route.page === 'story' ? <StoryPage /> : <AlbumPage />}
    </>
  )
}
