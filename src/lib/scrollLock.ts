/**
 * Reference-counted page scroll lock. The prologue, the menu and the lightbox can each hold a lock;
 * the page only scrolls again once every holder has released theirs.
 */
let holders = 0

export function lockScroll() {
  if (holders++ === 0) document.documentElement.style.overflow = 'hidden'
  let released = false
  return () => {
    if (released) return
    released = true
    if (--holders === 0) document.documentElement.style.overflow = ''
  }
}
