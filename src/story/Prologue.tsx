import { useEffect, useState } from 'react'
import { Rain } from './Rain'
import { PhoneBooth } from './PhoneBooth'
import { music } from '../lib/music'
import { lockScroll } from '../lib/scrollLock'
import { prefersReducedMotion } from '../components/FadeIn'
import { NARRATION } from '../data/story'

type Stage = 'ringing' | 'entering' | 'open'

/**
 * Prologue — a phone booth in the rain. Browsers only allow sound after a click, so on a first visit the
 * story waits here: picking up the phone starts the music, the rain tapers off, the camera flies into the
 * booth's light and lands in Chapter I. Visitors who muted before can simply scroll on.
 */
export function Prologue() {
  const [stage, setStage] = useState<Stage>('ringing')
  const [locked, setLocked] = useState(() => music.wantsSound())
  const [flash, setFlash] = useState(false)

  // Hold the page on this scene until the visitor answers (or the browser already allows sound).
  // Jumping to a chapter from the menu also lets them through, silently.
  useEffect(() => {
    if (!locked) return
    const unlock = lockScroll()
    let alive = true
    void music.tryAutoplay().then((ok) => {
      if (ok && alive) setLocked(false)
    })
    const onHash = () => setLocked(false)
    window.addEventListener('hashchange', onHash)
    return () => {
      alive = false
      unlock()
      window.removeEventListener('hashchange', onHash)
    }
  }, [locked])

  // "Start over" in the epilogue: it starts to rain again and the phone rings.
  useEffect(() => {
    const restart = () => setStage('ringing')
    window.addEventListener('story:restart', restart)
    return () => window.removeEventListener('story:restart', restart)
  }, [])

  const enter = (withSound: boolean) => {
    if (withSound) void music.enable()
    else music.disable()
    setLocked(false)
    const land = () => document.getElementById('cafe')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    if (prefersReducedMotion()) {
      setStage('open')
      land()
      return
    }
    setStage('entering')
    setFlash(true)
    window.setTimeout(() => {
      land()
      setStage('open')
      window.setTimeout(() => setFlash(false), 80)
    }, 1500)
  }

  const lines = stage === 'ringing' ? NARRATION.prologueBefore : NARRATION.prologueAfter

  return (
    <section id="prologue" className="prologue" data-stage={stage} aria-label="Prologue: the phone booth">
      <div className="prologue-sky" aria-hidden="true" />
      <Rain intensity={stage === 'ringing' ? 1 : 0.12} />
      <div className="prologue-street" aria-hidden="true" />
      <div className="prologue-content">
        <div className="prologue-head">
          <p className="story-eyebrow">Slow Summer Eve · a photography portfolio in five scenes</p>
          <h1 className="prologue-title">Kayshawn Yen</h1>
        </div>
        <div className="prologue-booth-wrap">
          <PhoneBooth state={stage === 'ringing' ? 'ringing' : 'picked'} onPick={() => enter(true)} />
        </div>
        <div className="prologue-foot">
          <p className="story-narration prologue-lines" key={stage === 'ringing' ? 'before' : 'after'}>
            {lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          {locked ? (
            <button type="button" className="story-quiet" onClick={() => enter(false)}>
              Continue in silence
            </button>
          ) : (
            <a href="#cafe" className="story-scroll-cue">
              Scroll into the night
            </a>
          )}
        </div>
      </div>
      <div className={`story-flash ${flash ? 'on' : ''}`} aria-hidden="true" />
    </section>
  )
}
