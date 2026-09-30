import { useEffect } from 'react'
import { music } from './music'

/**
 * Music is on by default. Some browsers let a site a visitor often returns to play sound straight away, so try that
 * first; everyone else starts it with the Enter button on the entry screen. A visitor who muted stays muted.
 */
export function useMusicAutostart() {
  useEffect(() => {
    if (music.wantsSound()) void music.tryAutoplay()
  }, [])
}
