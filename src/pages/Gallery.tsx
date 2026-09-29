import { FadeIn } from '../components/FadeIn'
import { ContactButton } from '../components/Buttons'
import { Pic } from '../components/Lightbox'
import { SeriesParticles } from '../components/SeriesParticles'
import { THEMES, type Theme } from '../data/content'
import { WORLDS } from '../data/story'

export type World = 'country' | 'city'

const TABS: { world: World | null; label: string; href: string }[] = [
  { world: null, label: 'All', href: '#/gallery' },
  { world: 'country', label: 'The Country', href: '#/gallery/country' },
  { world: 'city', label: 'The City', href: '#/gallery/city' },
]

function ThemeSection({ theme }: { theme: Theme }) {
  return (
    <section id={theme.slug} className="album-series relative max-w-5xl mx-auto py-16 md:py-20 scroll-mt-24">
      {theme.particles && <SeriesParticles kind={theme.particles} />}
      <FadeIn>
        <p className="album-world">{WORLDS[theme.world].label}</p>
        <h2 className="text-[#D7E2EA] font-black uppercase leading-none" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
          {theme.title}
        </h2>
        <p className="album-mood">{theme.mood}</p>
      </FadeIn>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-10">
        {theme.images.map((src, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <Pic src={src} alt={theme.title} sizes="(min-width: 1024px) 330px, (min-width: 640px) 33vw, 50vw" className="w-full object-cover rounded-2xl" style={{ aspectRatio: '4/5' }} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

/** The album: every series, optionally narrowed to one of the fable's two worlds. Series scrolling is done by the router. */
export function GalleryPage({ world }: { world: World | null }) {
  const themes = world ? THEMES.filter((t) => t.world === world) : THEMES
  const frames = themes.reduce((n, t) => n + t.images.length, 0)
  return (
    <div className="album" style={{ overflowX: 'clip' }}>
      <div className="px-5 sm:px-8 md:px-10 pt-28 md:pt-32">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <p className="story-eyebrow">Slow Summer Eve · the album</p>
          <h1 className="album-title">{world ? WORLDS[world].label : 'The Album'}</h1>
          <p className="album-intro">
            {world ? WORLDS[world].line : 'Every series from the night, grouped by mood rather than name'} · {themes.length} series, {frames} frames.
          </p>
          <nav className="album-tabs" aria-label="Filter by world">
            {TABS.map((t) => (
              <a key={t.label} href={t.href} aria-current={t.world === world ? 'page' : undefined}>
                {t.label}
              </a>
            ))}
          </nav>
        </FadeIn>
        {themes.map((theme) => (
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
