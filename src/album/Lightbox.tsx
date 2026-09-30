import { useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import { largestSrc } from '../lib/photos'
import { lockScroll } from '../lib/scrollLock'

export interface LightboxState {
  images: string[]
  index: number
  title: string
}

/** Full-screen viewer for one series. Arrow keys step through it, Escape or the backdrop closes it. */
export function Lightbox({ state, onChange, onClose }: { state: LightboxState; onChange: (index: number) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const { images, index, title } = state
  const step = useCallback((d: number) => onChange((index + d + images.length) % images.length), [images.length, index, onChange])

  useEffect(() => lockScroll(), [])
  useEffect(() => {
    closeRef.current?.focus()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, step])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title}, photograph ${index + 1} of ${images.length}`} onClick={onClose}>
      <img key={images[index]} className="lightbox-photo" src={largestSrc(images[index])} alt={`${title}, photograph ${index + 1}`} onClick={(e) => e.stopPropagation()} />
      <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
        <span className="lightbox-count">
          {title} <span>{index + 1} / {images.length}</span>
        </span>
        {images.length > 1 && (
          <>
            <button type="button" className="icon-button" onClick={() => step(-1)} aria-label="Previous photograph">
              <ArrowLeft size={18} />
            </button>
            <button type="button" className="icon-button" onClick={() => step(1)} aria-label="Next photograph">
              <ArrowRight size={18} />
            </button>
          </>
        )}
        <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
