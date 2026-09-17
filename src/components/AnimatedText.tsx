import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { prefersReducedMotion } from './FadeIn'

interface AnimatedTextProps {
  text: string
  className?: string
  style?: CSSProperties
}

/** Character-by-character scroll-reveal text animation. */
export function AnimatedText({ text, className = '', style = {} }: AnimatedTextProps) {
  const pRef = useRef<HTMLParagraphElement | null>(null)
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([])
  const chars = useMemo(() => text.split(''), [text])

  useEffect(() => {
    if (prefersReducedMotion()) {
      spanRefs.current.forEach((s) => s && (s.style.opacity = '1'))
      return
    }
    let raf = 0
    function update() {
      const el = pRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const startLine = vh * 0.8
      const endLine = vh * 0.2
      const progress = Math.min(1, Math.max(0, (startLine - rect.top) / (startLine - endLine)))
      const n = chars.length
      spanRefs.current.forEach((s, i) => {
        if (!s) return
        const charProgress = Math.min(1, Math.max(0, progress * n - i))
        s.style.opacity = String(0.2 + charProgress * 0.8)
      })
    }
    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(() => {
        update()
        raf = 0
      })
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [chars.length])

  return (
    <p ref={pRef} className={className} style={style}>
      {chars.map((c, i) => (
        <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ visibility: 'hidden' }}>{c === ' ' ? ' ' : c}</span>
          <span
            ref={(el) => {
              spanRefs.current[i] = el
            }}
            style={{ position: 'absolute', left: 0, top: 0, opacity: 0.2 }}
          >
            {c === ' ' ? ' ' : c}
          </span>
        </span>
      ))}
    </p>
  )
}
