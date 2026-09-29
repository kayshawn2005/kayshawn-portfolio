import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from 'react'
import { PHOTOS } from '../data/photos.gen'
import { optimizedSrcSet, photoName } from '../lib/photos'
import { prefersReducedMotion } from './FadeIn'

interface PictureProps {
  src: string
  alt?: string
  sizes?: string
  className?: string
  style?: CSSProperties
  eager?: boolean
  /** Darkroom reveal: the print starts over-exposed and develops once loaded and on screen. */
  develop?: boolean
  onClick?: MouseEventHandler<HTMLImageElement>
}

/**
 * Responsive AVIF/WebP photo with the original JPG as fallback, intrinsic size (no layout shift)
 * and a 20px blurred placeholder painted underneath until the real image arrives.
 */
export function Picture({ src, alt = '', sizes = '100vw', className = '', style, eager = false, develop = true, onClick }: PictureProps) {
  const name = photoName(src)
  const meta = name ? PHOTOS[name] : undefined
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [developed, setDeveloped] = useState(() => !develop || prefersReducedMotion())

  useEffect(() => {
    if (developed) return
    const img = imgRef.current
    if (!img) return
    let seen = false
    let loaded = img.complete && img.naturalWidth > 0
    const check = () => {
      if (seen && loaded) setDeveloped(true)
    }
    const onLoad = () => {
      loaded = true
      check()
    }
    img.addEventListener('load', onLoad)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          seen = true
          io.disconnect()
          check()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(img)
    return () => {
      img.removeEventListener('load', onLoad)
      io.disconnect()
    }
  }, [developed])

  const imgStyle: CSSProperties = {
    ...(meta ? { backgroundImage: `url(${meta.lqip})`, backgroundSize: 'cover', backgroundPosition: style?.objectPosition ?? 'center' } : null),
    ...style,
  }
  const img = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      width={meta?.w}
      height={meta?.h}
      sizes={meta ? sizes : undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      onClick={onClick}
      className={`${className} ${develop ? 'develop' : ''} ${developed ? 'is-developed' : ''}`}
      style={imgStyle}
    />
  )
  if (!meta || !name) return img
  return (
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={optimizedSrcSet(name, meta.widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={optimizedSrcSet(name, meta.widths, 'webp')} sizes={sizes} />
      {img}
    </picture>
  )
}
