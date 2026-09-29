import { PHOTOS } from '../data/photos.gen'

/** '/photos/angelina-1.jpg' → 'angelina-1' */
export const photoName = (src: string) => src.match(/\/photos\/([^/]+)\.jpg$/)?.[1] ?? null

export const optimizedSrcSet = (name: string, widths: number[], ext: 'avif' | 'webp') =>
  widths.map((w) => `/photos/opt/${name}-${w}.${ext} ${w}w`).join(', ')

/** Smallest optimized WebP at least `minWidth` wide (for canvas/WebGL textures). */
export function sizedSrc(src: string, minWidth: number) {
  const name = photoName(src)
  const meta = name ? PHOTOS[name] : undefined
  if (!meta || !name) return src
  const w = meta.widths.find((x) => x >= minWidth) ?? meta.widths[meta.widths.length - 1]
  return `/photos/opt/${name}-${w}.webp`
}

/** Largest optimized WebP for a photo, where a single URL is needed (the lightbox). */
export function largestSrc(src: string) {
  const name = photoName(src)
  const meta = name ? PHOTOS[name] : undefined
  return meta && name ? `/photos/opt/${name}-${meta.widths[meta.widths.length - 1]}.webp` : src
}
