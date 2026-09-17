import { useEffect } from 'react'
import { FadeIn, prefersReducedMotion } from '../components/FadeIn'
import { ContactButton } from '../components/Buttons'
import { Pic } from '../components/Lightbox'
import { THEMES, type Theme } from '../data/content'

const heroHeadingClass = 'bg-gradient-to-b from-[#646973] to-[#BBCCD7] bg-clip-text text-transparent'

function ThemeSection({ theme }: { theme: Theme }) {
  return (
    <section id={theme.slug} className="max-w-5xl mx-auto py-16 md:py-20 scroll-mt-24" style={{ borderTop: '1px solid rgba(215,226,234,0.12)' }}>
      <FadeIn>
        <h2 className="text-[#D7E2EA] font-black uppercase leading-none" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
          {theme.title}
        </h2>
        <p className="text-[#D7E2EA]/50 mt-3 text-sm md:text-base max-w-md">{theme.mood}</p>
      </FadeIn>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-10">
        {theme.images.map((src, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <Pic src={src} alt={theme.title} className="w-full object-cover rounded-2xl" style={{ aspectRatio: '4/5' }} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

export function GalleryPage({ slug }: { slug: string | null }) {
  useEffect(() => {
    if (slug) {
      const t = setTimeout(() => {
        const el = document.getElementById(slug)
        if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      }, 60)
      return () => clearTimeout(t)
    } else {
      window.scrollTo(0, 0)
    }
  }, [slug])

  return (
    <div style={{ overflowX: 'clip', background: '#0C0C0C' }}>
      <div className="px-5 sm:px-8 md:px-10 pt-28 md:pt-32">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <h1 className={`${heroHeadingClass} font-black uppercase leading-none`} style={{ fontSize: 'clamp(2.5rem, 9vw, 100px)' }}>
            The Gallery
          </h1>
          <p className="text-[#D7E2EA]/60 mt-4 text-sm md:text-base">
            Every series, grouped by mood rather than name — {THEMES.length} shoots, {THEMES.reduce((n, t) => n + t.images.length, 0)} frames.
          </p>
        </FadeIn>
        {THEMES.map((theme) => (
          <ThemeSection key={theme.slug} theme={theme} />
        ))}
      </div>
      <div id="contact" className="max-w-5xl mx-auto flex flex-col items-center gap-6 py-20 text-center">
        <p className="text-[#D7E2EA]/60 uppercase tracking-widest text-xs sm:text-sm">Get in touch</p>
        <ContactButton />
        <p className="text-[#D7E2EA]/40 text-xs sm:text-sm mt-6">&copy; 2026 Kayshawn Yen &middot; Built for a college application portfolio</p>
      </div>
    </div>
  )
}
