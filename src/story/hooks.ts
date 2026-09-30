import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { music } from '../lib/music'
import { prefersReducedMotion } from '../lib/motion'

export const useMusicOn = () => useSyncExternalStore(music.subscribe, music.getOn, () => false)

/** True once the element has been on screen (it stays true). */
export function useSeen<T extends Element>(threshold = 0.35) {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(() => prefersReducedMotion())
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])
  return [ref, seen] as const
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
}
