import { Fragment, useCallback, useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { prefersReducedMotion } from './FadeIn'
import { clamp01, useScrollEffect } from '../lib/scroll'

interface AnimatedTextProps {
  text: string
  className?: string
  style?: CSSProperties
}

/**
 * Character-by-character scroll-reveal text. Characters are grouped into unbreakable words,
 * so lines only wrap between words.
 */
export function AnimatedText({ text, className = '', style = {} }: AnimatedTextProps) {
  const pRef = useRef<HTMLParagraphElement | null>(null)
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([])
  const words = useMemo(() => text.split(' '), [text])
  const total = useMemo(() => words.reduce((n, w) => n + w.length, 0), [words])

  // 0 when the paragraph's top reaches 80% of the viewport, 1 at 20%
  const paint = useCallback(
    (rect: DOMRect, vh: number) => {
      const p = clamp01((vh * 0.8 - rect.top) / (vh * 0.6))
      spanRefs.current.forEach((s, i) => {
        if (s) s.style.opacity = String(0.2 + clamp01(p * total - i) * 0.8)
      })
    },
    [total],
  )
  useScrollEffect(pRef, paint)
  useEffect(() => {
    if (prefersReducedMotion()) spanRefs.current.forEach((s) => s && (s.style.opacity = '1'))
  }, [])

  let k = 0
  return (
    <p ref={pRef} className={className} style={style}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...word].map((c) => {
              const i = k++
              return (
                <span
                  key={i}
                  ref={(el) => {
                    spanRefs.current[i] = el
                  }}
                  style={{ opacity: 0.2 }}
                >
                  {c}
                </span>
              )
            })}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </p>
  )
}
