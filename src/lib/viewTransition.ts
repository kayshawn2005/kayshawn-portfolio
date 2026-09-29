import { prefersReducedMotion } from '../components/FadeIn'

export type TransitionKind = 'page' | 'lightbox'

/**
 * Runs a DOM update inside a View Transition when the browser supports it (Chrome/Edge, Safari 18+,
 * Firefox 144+) and the visitor hasn't asked for reduced motion; otherwise just runs it.
 * `data-vt` on <html> lets the CSS pick the animation for each kind.
 */
export function withViewTransition(kind: TransitionKind, update: () => void, done?: () => void) {
  if (!('startViewTransition' in document) || prefersReducedMotion()) {
    update()
    done?.()
    return
  }
  const root = document.documentElement
  root.dataset.vt = kind
  const vt = document.startViewTransition(update)
  vt.finished.finally(() => {
    delete root.dataset.vt
    done?.()
  })
}
