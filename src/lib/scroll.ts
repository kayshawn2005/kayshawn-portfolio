import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '../components/FadeIn'

/**
 * One shared scroll listener for every scroll-linked effect on the site: all subscribers run
 * together in a single requestAnimationFrame per frame, instead of each component listening
 * and reading layout on its own.
 */
type Job = () => void
const jobs = new Set<Job>()
let frame = 0
const flush = () => {
  frame = 0
  jobs.forEach((job) => job())
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(flush)
}
let listening = false

function onScrollFrame(job: Job) {
  if (!listening) {
    listening = true
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  jobs.add(job)
  schedule()
  return () => {
    jobs.delete(job)
  }
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Calls `effect` with the element's box and the viewport height on every scroll frame.
 * Skipped entirely for visitors who prefer reduced motion. Pass a stable (memoized) effect.
 */
export function useScrollEffect(ref: RefObject<Element | null>, effect: (rect: DOMRect, viewport: number) => void) {
  useEffect(() => {
    if (prefersReducedMotion()) return
    return onScrollFrame(() => {
      const el = ref.current
      if (el) effect(el.getBoundingClientRect(), window.innerHeight)
    })
  }, [ref, effect])
}
