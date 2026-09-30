import { useSyncExternalStore } from 'react'
import { music } from './music'

/** Re-renders when the soundtrack is switched on or off. */
export function useMusicOn() {
  return useSyncExternalStore(music.subscribe, music.getOn, () => false)
}
