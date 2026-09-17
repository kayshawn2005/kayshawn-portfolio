import { useEffect } from 'react'
import { FadeIn } from '../components/FadeIn'
import { AnimatedText } from '../components/AnimatedText'
import { ContactButton } from '../components/Buttons'
import { Pic } from '../components/Lightbox'
import { KAYSHAWN_PORTRAIT } from '../data/content'

const heroHeadingClass = 'bg-gradient-to-b from-[#646973] to-[#BBCCD7] bg-clip-text text-transparent'

const TAGS = ['Portraits', 'Cosplay', 'Bridal & Editorial', 'Graduation & Events', 'Automotive', 'Cinematic Color']

export function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ overflowX: 'clip', background: '#0C0C0C' }}>
      <div className="px-5 sm:px-8 md:px-10 pt-28 md:pt-36 pb-16 md:pb-24 max-w-4xl mx-auto flex flex-col items-center">
        <FadeIn className="text-center">
          <h1 className={`${heroHeadingClass} font-black uppercase leading-none tracking-tight`} style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
            About me
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10 md:mt-14 w-[220px] sm:w-[260px] md:w-[300px]">
          <Pic src={KAYSHAWN_PORTRAIT} alt="Kayshawn Yen" className="w-full rounded-3xl" eager />
        </FadeIn>

        <div className="flex flex-col gap-6 md:gap-8 mt-14 md:mt-16 max-w-2xl">
          <AnimatedText
            text="With five years behind the camera, i split my time between two very different worlds: golden-hour bridal editorial on the coast, and character photography at conventions like anime expo."
            className="text-[#D7E2EA] font-medium leading-relaxed text-center"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
          <FadeIn delay={0.1}>
            <p className="text-[#D7E2EA]/70 font-light leading-relaxed text-center" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)' }}>
              It started in high school, where i spent two years in Advanced Video Production, learning composition, lighting, camera movement, and how a single frame can tell a story.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-[#D7E2EA]/70 font-light leading-relaxed text-center" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)' }}>
              In college at Mt. San Antonio College, i studied Digital Photography and the History of Photography, building the technical side — portrait lighting, Lightroom editing, composites, and shooting around a real theme.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[#D7E2EA]/70 font-light leading-relaxed text-center" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)' }}>
              i run K Picture Studio, my own photography brand, covering portraits, cosplay, bridal, graduation, events, and automotive work. i lean toward a cinematic, teal-and-orange color style — atmospheric but still natural. i still bring my video background into short films and music-video projects on the side.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="flex flex-wrap justify-center gap-3 mt-12 md:mt-16">
          {TAGS.map((tag) => (
            <span key={tag} className="border border-[#D7E2EA]/30 rounded-full px-5 py-2 text-xs md:text-sm uppercase tracking-wide text-[#D7E2EA]/80">
              {tag}
            </span>
          ))}
        </FadeIn>

        <FadeIn delay={0.3} className="grid grid-cols-2 gap-6 md:gap-10 mt-12 md:mt-16 text-center border-t border-white/10 pt-10 w-full max-w-xs">
          <div>
            <div className="text-[#D7E2EA] font-black" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
              5
            </div>
            <div className="text-[#D7E2EA]/50 text-xs uppercase tracking-wide mt-1">Years shooting</div>
          </div>
          <div>
            <div className="text-[#D7E2EA] font-black" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
              40+
            </div>
            <div className="text-[#D7E2EA]/50 text-xs uppercase tracking-wide mt-1">Shoots archived</div>
          </div>
        </FadeIn>

        <FadeIn delay={0.35} className="mt-14 md:mt-16">
          <ContactButton />
        </FadeIn>
      </div>
    </div>
  )
}
