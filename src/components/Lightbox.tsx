import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { X } from 'lucide-react'
import { Picture } from './Picture'
import { largestSrc } from '../lib/photos'
import { lockScroll } from '../lib/scrollLock'
import { withViewTransition } from '../lib/viewTransition'

type OpenFn = (src: string, alt?: string, from?: HTMLElement | null) => void
type Item = { src: string; alt: string; from: HTMLElement | null }

const LightboxCtx = createContext<OpenFn>(() => {})
const MORPH = 'lightbox-photo'

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<Item | null>(null)
  const [zoomed, setZoomed] = useState(false)

  // The clicked thumbnail and the lightbox image share one view-transition-name, so the photo morphs between them.
  const open: OpenFn = useCallback((src, alt, from = null) => {
    const next = { src, alt: alt || '', from }
    if (from) from.style.viewTransitionName = MORPH
    withViewTransition('lightbox', () => {
      if (from) from.style.viewTransitionName = ''
      flushSync(() => {
        setZoomed(false)
        setItem(next)
      })
    })
  }, [])

  const itemRef = useRef<Item | null>(null)
  useEffect(() => {
    itemRef.current = item
  }, [item])

  const close = useCallback(() => {
    const from = itemRef.current?.from
    if (!itemRef.current) return
    withViewTransition(
      'lightbox',
      () => {
        flushSync(() => setItem(null))
        if (from?.isConnected) from.style.viewTransitionName = MORPH
      },
      () => {
        if (from) from.style.viewTransitionName = ''
      },
    )
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => (item ? lockScroll() : undefined), [item])

  return (
    <LightboxCtx.Provider value={open}>
      {children}
      {item && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col" onClick={close} role="dialog" aria-modal="true" aria-label={item.alt || 'Photo'}>
          <div className="flex justify-between items-center px-5 md:px-8 py-4 md:py-5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs md:text-sm uppercase tracking-widest">{zoomed ? 'Click image to zoom out' : 'Click image to zoom in'}</p>
            <button onClick={close} aria-label="Close" className="text-white/70 hover:text-white transition-colors">
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center px-4 pb-6">
            <img
              src={largestSrc(item.src)}
              alt={item.alt}
              onClick={(e) => {
                e.stopPropagation()
                setZoomed((z) => !z)
              }}
              style={
                {
                  viewTransitionName: MORPH,
                  ...(zoomed
                    ? { width: 'auto', height: 'auto', maxWidth: 'none', maxHeight: 'none', cursor: 'zoom-out' }
                    : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }),
                } as CSSProperties
              }
            />
          </div>
        </div>
      )}
    </LightboxCtx.Provider>
  )
}

interface PicProps {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
  eager?: boolean
  sizes?: string
}

/** A photo that opens the shared Lightbox on click, for full-size zoom viewing. */
export function Pic({ src, alt = '', className = '', style = {}, eager = false, sizes }: PicProps) {
  const open = useContext(LightboxCtx)
  return (
    <Picture
      src={src}
      alt={alt}
      sizes={sizes}
      eager={eager}
      onClick={(e) => {
        e.stopPropagation()
        open(src, alt, e.currentTarget)
      }}
      className={className}
      style={{ cursor: 'zoom-in', ...style }}
    />
  )
}
