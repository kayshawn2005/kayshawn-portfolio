import { PHOTO_SIZES } from '../data/photoSizes'

/** '/photos/angelina-1.jpg' → [1600, 900], or undefined for an unknown file. */
export function sizeOf(src: string): [number, number] | undefined {
  const name = src.match(/\/photos\/([^/]+)\.jpg$/)?.[1]
  return name ? PHOTO_SIZES[name] : undefined
}

/** Width ÷ height of a photo (4:5 if it isn't in the size table yet). */
export function ratioOf(src: string) {
  const s = sizeOf(src)
  return s ? s[0] / s[1] : 0.8
}
