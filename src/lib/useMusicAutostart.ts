import { useEffect } from 'react'
import { music } from './music'

// Events browsers accept as the "user gesture" that allows sound (touchstart is not one of them).
const GESTURES = ['pointerup', 'keydown', 'touchend'] as const

/**
 * Music is on by default. Browsers only allow sound once the visitor has interacted with the page, so: try to play
 * straight away (allowed for returning visitors on some browsers), otherwise start on the first click, tap or key
 * press anywhere. A click on the sound switch itself is left to the switch. A visitor who muted stays muted.
 */
export function useMusicAutostart() {
  useEffect(() => {
    if (!music.wantsSound()) return
    let armed = false
    const stop = () => {
      if (!armed) return
      armed = false
      GESTURES.forEach((type) => window.removeEventListener(type, start, true))
    }
    function start(e: Event) {
      if (e.target instanceof Element && e.target.closest('[data-sound-toggle]')) return
      stop()
      if (!music.on) void music.enable()
    }
    let alive = true
    void music.tryAutoplay().then((playing) => {
      if (playing || !alive || music.on) return
      armed = true
      GESTURES.forEach((type) => window.addEventListener(type, start, true))
    })
    return () => {
      alive = false
      stop()
    }
  }, [])
}
