import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react'

const EASE = 'cubic-bezier(0.25,0.1,0.25,1)'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  x?: number
  y?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}

export function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, as = 'div', className = '', style = {} }: FadeInProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const Tag = as as ElementType

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -50px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const motionStyle: CSSProperties = prefersReducedMotion()
    ? style
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : `translate(${x}px,${y}px)`,
        transition: `opacity ${duration}s ${EASE} ${delay}s, transform ${duration}s ${EASE} ${delay}s`,
        willChange: 'transform, opacity',
        ...style,
      }

  return (
    <Tag ref={ref} className={className} style={motionStyle}>
      {children}
    </Tag>
  )
}
