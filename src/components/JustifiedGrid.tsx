import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FadeIn } from './FadeIn'
import { Pic } from './Lightbox'
import { ratioOf } from '../lib/photos'
import { justify } from '../lib/justify'

interface JustifiedGridProps {
  images: string[]
  alt: string
  /** Row height to aim for at a given container width. Default: about a third of the width, 170 to 360px. */
  targetFor?: (width: number) => number
  /** Classes for each photo (corner radius etc.). */
  photoClass?: string
}

const defaultTarget = (width: number) => Math.max(170, Math.min(360, width * 0.34))

/**
 * Photographs at their own proportions: rows fill the width edge to edge, every photo in a row shares its height,
 * and nothing is cropped. Row heights adapt to the screen (shorter rows on phones).
 */
export function JustifiedGrid({ images, alt, targetFor = defaultTarget, photoClass = 'rounded-2xl' }: JustifiedGridProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const gap = width < 640 ? 10 : 16
  const target = targetFor(width)
  const rows = useMemo(() => justify(images.map(ratioOf), width, target, gap), [images, width, target, gap])

  return (
    <div ref={ref} className="flex flex-col" style={{ gap }}>
      {rows.map((row, r) => (
        <div key={r} className="flex" style={{ gap, height: row.height }}>
          {row.items.map((i) => (
            <FadeIn key={images[i]} delay={i * 0.05} className="h-full min-w-0" style={{ width: row.height * ratioOf(images[i]) }}>
              <Pic src={images[i]} alt={alt} className={`w-full h-full object-cover ${photoClass}`} />
            </FadeIn>
          ))}
        </div>
      ))}
    </div>
  )
}
