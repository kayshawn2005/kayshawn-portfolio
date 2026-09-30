export interface JustifiedRow {
  /** Indexes of the photos in this row, in order. */
  items: number[]
  /** Row height in px; every photo in the row shares it, and its width is height × its aspect ratio. */
  height: number
}

/**
 * Splits photos (given as width ÷ height ratios) into rows that fill `width` edge to edge, keeping each photo's own
 * proportions. Rows are chosen together (dynamic programming) so every row lands as close to `target` height as
 * possible: no lone portrait blown up to fill a row, no strip of tiny thumbnails. The last row fills the width too,
 * unless that would make it much taller than the others; then it keeps the target height and ends short.
 */
export function justify(ratios: number[], width: number, target: number, gap: number, maxPerRow = 4): JustifiedRow[] {
  const n = ratios.length
  if (!n || width <= 0) return []
  const best = new Array<number>(n + 1).fill(Infinity)
  const from = new Array<number>(n + 1).fill(0)
  const heightOf = (i: number, j: number) => {
    let sum = 0
    for (let k = i; k < j; k++) sum += ratios[k]
    const h = (width - gap * (j - i - 1)) / sum
    return j === n && h > target * 1.35 ? target : h
  }
  best[0] = 0
  for (let j = 1; j <= n; j++) {
    for (let i = Math.max(0, j - maxPerRow); i < j; i++) {
      const h = heightOf(i, j)
      // relative error, so short and tall rows are judged fairly; a last row that stops short pays for its gap
      const miss = (h - target) / target
      let used = -gap
      for (let k = i; k < j; k++) used += ratios[k] * h + gap
      const empty = 1 - used / width
      const cost = best[i] + miss * miss + (empty > 0.01 ? empty * empty * 0.5 : 0)
      if (cost < best[j]) {
        best[j] = cost
        from[j] = i
      }
    }
  }
  const rows: JustifiedRow[] = []
  for (let j = n; j > 0; j = from[j]) {
    const i = from[j]
    rows.unshift({ items: Array.from({ length: j - i }, (_, k) => i + k), height: heightOf(i, j) })
  }
  return rows
}
