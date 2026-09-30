import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { FadeIn, prefersReducedMotion } from './FadeIn'
import { music, TRACK } from '../lib/music'

const heroHeadingClass = 'bg-gradient-to-b from-[#646973] to-[#BBCCD7] bg-clip-text text-transparent'

/**
 * The front door. Browsers only let a page play sound after the visitor clicks, so the site opens on this screen:
 * pressing Enter is that click, and the music fades in as the screen fades away to reveal the site behind it.
 */
export function EntryScreen() {
  const [state, setState] = useState<'open' | 'leaving' | 'gone'>('open')
  const enterRef = useRef<HTMLButtonElement | null>(null)

  // Hold the page still while the screen is up. (On <body>: the lightbox manages overflow on <html>.)
  useEffect(() => {
    if (state === 'gone') return
    const body = document.body
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = ''
    }
  }, [state])

  useEffect(() => {
    enterRef.current?.focus({ preventScroll: true })
  }, [])

  const enter = (withSound: boolean) => {
    if (state !== 'open') return
    if (withSound) void music.enable()
    else music.disable()
    if (prefersReducedMotion()) {
      setState('gone')
      return
    }
    setState('leaving')
    window.setTimeout(() => setState('gone'), 800)
  }

  if (state === 'gone') return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enter Kayshawn Yen's portfolio"
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center gap-8 sm:gap-10 bg-[#0C0C0C] px-6 text-center transition-opacity duration-700 ${state === 'leaving' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <FadeIn delay={0.1} y={20}>
        <p className="text-[#D7E2EA]/60 uppercase tracking-[0.3em] text-xs sm:text-sm">Photography portfolio</p>
      </FadeIn>
      <FadeIn delay={0.25} y={40}>
        <h1 className={`${heroHeadingClass} font-black uppercase tracking-tight leading-none`} style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}>
          Kayshawn Yen
        </h1>
      </FadeIn>
      <FadeIn delay={0.5} y={20} className="flex flex-col items-center gap-5">
        <button
          ref={enterRef}
          type="button"
          onClick={() => enter(true)}
          className="inline-flex items-center gap-2 rounded-full px-10 py-3.5 sm:px-12 sm:py-4 text-sm sm:text-base text-white font-medium uppercase tracking-widest transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
          style={{
            background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
            boxShadow: '0px 4px 4px rgba(181,1,167,0.25), 4px 4px 12px #7721B1 inset',
            outline: '2px solid white',
            outlineOffset: '-3px',
          }}
        >
          Enter
          <ArrowUpRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => enter(false)}
          className="text-[#D7E2EA]/50 hover:text-[#D7E2EA] uppercase tracking-widest text-xs transition-colors duration-200 cursor-pointer"
        >
          Enter without sound
        </button>
      </FadeIn>
      <FadeIn delay={0.8} y={10} className="absolute bottom-8 left-0 right-0">
        <p className="text-[#D7E2EA]/40 text-xs tracking-wider">
          ♪ {TRACK.title} · {TRACK.artist}
        </p>
      </FadeIn>
    </div>
  )
}
