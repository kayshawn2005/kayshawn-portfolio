import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from './FadeIn'

interface MagnetProps {
  children: ReactNode
  padding?: number
  strength?: number
  className?: string
}

/** Mouse-following magnetic hover effect. */
export function Magnet({ children, padding = 150, strength = 3, className = '' }: MagnetProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    let active = false

    function onMove(e: MouseEvent) {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const withinX = e.clientX > rect.left - padding && e.clientX < rect.right + padding
      const withinY = e.clientY > rect.top - padding && e.clientY < rect.bottom + padding

      if (withinX && withinY) {
        if (!active) {
          active = true
          el.style.transition = 'transform 0.3s ease-out'
        }
        const dx = (e.clientX - cx) / strength
        const dy = (e.clientY - cy) / strength
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
      } else if (active) {
        active = false
        el.style.transition = 'transform 0.6s ease-in-out'
        el.style.transform = 'translate3d(0,0,0)'
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMove)
  }, [padding, strength])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
