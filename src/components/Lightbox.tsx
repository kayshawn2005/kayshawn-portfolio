import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { X } from 'lucide-react'

type OpenFn = (src: string, alt?: string) => void

const LightboxCtx = createContext<OpenFn>(() => {})

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<{ src: string; alt: string } | null>(null)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setItem(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = item ? 'hidden' : ''
    if (!item) setZoomed(false)
  }, [item])

  const open: OpenFn = (src, alt) => setItem({ src, alt: alt || '' })

  return (
    <LightboxCtx.Provider value={open}>
      {children}
      {item && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col" onClick={() => setItem(null)}>
          <div className="flex justify-between items-center px-5 md:px-8 py-4 md:py-5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs md:text-sm uppercase tracking-widest">
              {zoomed ? 'Click image to zoom out' : 'Click image to zoom in'}
            </p>
            <button onClick={() => setItem(null)} aria-label="Close" className="text-white/70 hover:text-white transition-colors">
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center px-4 pb-6">
            <img
              src={item.src}
              alt={item.alt}
              onClick={(e) => {
                e.stopPropagation()
                setZoomed((z) => !z)
              }}
              style={
                zoomed
                  ? ({ width: 'auto', height: 'auto', maxWidth: 'none', maxHeight: 'none', cursor: 'zoom-out' } as CSSProperties)
                  : ({ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' } as CSSProperties)
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
}

/** An <img> that opens the shared Lightbox on click, for full-size zoom viewing. */
export function Pic({ src, alt = '', className = '', style = {}, eager = false }: PicProps) {
  const open = useContext(LightboxCtx)
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? undefined : 'lazy'}
      onClick={(e) => {
        e.stopPropagation()
        open(src, alt)
      }}
      className={className}
      style={{ cursor: 'zoom-in', ...style }}
    />
  )
}
