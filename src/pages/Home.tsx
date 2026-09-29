import { useCallback, useMemo, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { clamp01, useScrollEffect } from '../lib/scroll'
import { Magnet } from '../components/Magnet'
import { AnimatedText } from '../components/AnimatedText'
import { ContactButton, GhostButton } from '../components/Buttons'
import { Pic } from '../components/Lightbox'
import { HeroReel } from '../components/HeroReel'
import { MARQUEE_ROW1, MARQUEE_ROW2, SERVICES, PROJECTS, KAYSHAWN_PORTRAIT, type FeaturedProject, type Service } from '../data/content'

const heroHeadingClass = 'bg-gradient-to-b from-[#646973] to-[#BBCCD7] bg-clip-text text-transparent'

/* ---------------- Hero: the reel, with the name over it ---------------- */
function HeroSection() {
  return (
    <section className="hero relative h-[100svh] min-h-[560px] flex flex-col" style={{ overflowX: 'clip' }}>
      <HeroReel />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <FadeIn delay={0.15} y={40} className="w-full px-4">
          <h1 className="hero-name bg-gradient-to-b from-[#8A919B] to-[#DCE6EE] bg-clip-text text-transparent font-black uppercase tracking-tight text-center">
            <span>hi, i&apos;m </span>
            <span>kayshawn</span>
          </h1>
        </FadeIn>
        <div className="flex justify-between items-end gap-4 sm:gap-6 pt-5 pb-7 sm:pb-8 md:pb-10 px-5 sm:px-6 md:px-10">
          <FadeIn delay={0.35} y={20}>
            <p className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[170px] sm:max-w-[220px] md:max-w-[260px]" style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}>
              a photographer driven by capturing striking and unforgettable moments
            </p>
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Marquee ---------------- */
function MarqueeRow({ images, direction, sectionRef }: { images: string[]; direction: 'left' | 'right'; sectionRef: React.RefObject<HTMLElement | null> }) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const tripled = useMemo(() => [...images, ...images, ...images], [images])
  // 0 as the section enters the viewport, 1 as it leaves; the rows drift 500px in opposite directions
  const drift = useCallback(
    (rect: DOMRect, vh: number) => {
      const p = clamp01((vh - rect.top) / (rect.height + vh))
      const x = direction === 'right' ? -200 + 500 * p : 200 - 500 * p
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`
    },
    [direction],
  )
  useScrollEffect(sectionRef, drift)

  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className="flex gap-3" style={{ willChange: 'transform' }}>
        {tripled.map((src, i) => (
          <Pic key={i} src={src} alt="" sizes="420px" className="rounded-2xl object-cover flex-shrink-0" style={{ width: '420px', height: '270px' }} />
        ))}
      </div>
    </div>
  )
}

function MarqueeSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  return (
    <section ref={sectionRef} className="bg-[#0C0C0C] pt-16 sm:pt-24 md:pt-28 pb-10 flex flex-col gap-3">
      <MarqueeRow images={MARQUEE_ROW1} direction="right" sectionRef={sectionRef} />
      <MarqueeRow images={MARQUEE_ROW2} direction="left" sectionRef={sectionRef} />
    </section>
  )
}

/* ---------------- About teaser: the portrait card over the heading ---------------- */
function AboutTeaser() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 relative">
      <FadeIn delay={0} y={40} className="text-center">
        <h2 className={`${heroHeadingClass} font-black uppercase leading-none tracking-tight`} style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
          About me
        </h2>
      </FadeIn>
      <Magnet padding={150} strength={3} className="relative z-10 -mt-[5vw] sm:-mt-[4.5vw] lg:-mt-16 w-[200px] sm:w-[260px] md:w-[300px]">
        <FadeIn delay={0.2} y={30}>
          <Pic src={KAYSHAWN_PORTRAIT} alt="Kayshawn Yen, photographer" sizes="300px" className="w-full rounded-3xl" />
        </FadeIn>
      </Magnet>

      <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16 mt-10 sm:mt-14 md:mt-16">
        <AnimatedText
          text="With five years behind the camera, i split my time between two worlds: golden-hour bridal editorial on the coast, and character photography at conventions. i run k picture studio and love building a full visual style from concept to final color grade."
          className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px]"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
        />
        <div className="flex flex-col items-center gap-6">
          <ContactButton />
          <a href="#/about" className="text-[#D7E2EA]/60 text-sm uppercase tracking-widest hover:text-[#D7E2EA] transition-colors duration-200 flex items-center gap-2">
            Read the full story <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Services ---------------- */
function ServiceRow({ item, i }: { item: Service; i: number }) {
  return (
    <FadeIn delay={i * 0.1} y={20}>
      <div className="flex items-start gap-6 sm:gap-10 py-8 sm:py-10 md:py-12" style={{ borderBottom: i < SERVICES.length - 1 ? '1px solid rgba(12,12,12,0.15)' : 'none' }}>
        <span className="font-black text-[#0C0C0C] flex-shrink-0" style={{ fontSize: 'clamp(3rem, 10vw, 140px)', lineHeight: 1 }}>
          {item.num}
        </span>
        <div className="flex flex-col gap-3 pt-2 sm:pt-4">
          <h3 className="font-medium uppercase text-[#0C0C0C]" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>
            {item.name}
          </h3>
          <p className="font-light leading-relaxed max-w-2xl text-[#0C0C0C]" style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 }}>
            {item.desc}
          </p>
        </div>
      </div>
    </FadeIn>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 relative z-10">
      <h2 className="font-black uppercase text-center text-[#0C0C0C]" style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
        Services
      </h2>
      <div className="max-w-5xl mx-auto mt-16 sm:mt-20 md:mt-28" style={{ borderTop: '1px solid rgba(12,12,12,0.15)' }}>
        {SERVICES.map((item, i) => (
          <ServiceRow key={item.num} item={item} i={i} />
        ))}
      </div>
    </section>
  )
}

/* ---------------- Projects ---------------- */
function ProjectCard({ project, index, total }: { project: FeaturedProject; index: number; total: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const targetScale = 1 - (total - 1 - index) * 0.03
  // cards shrink slightly as the next one stacks over them
  const shrink = useCallback(
    (rect: DOMRect, vh: number) => {
      const p = clamp01((vh - rect.top) / (rect.height + vh))
      if (cardRef.current) cardRef.current.style.transform = `scale(${(1 - p * (1 - targetScale)).toFixed(4)})`
    },
    [targetScale],
  )
  useScrollEffect(wrapRef, shrink)

  return (
    <div ref={wrapRef} className="h-[85vh]">
      <div className="sticky" style={{ top: `calc(6rem + ${index * 28}px)` }}>
        <div
          ref={cardRef}
          className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8"
          style={{ willChange: 'transform', transformOrigin: 'top center' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="font-black text-[#D7E2EA]" style={{ fontSize: 'clamp(2.2rem, 7vw, 6rem)', lineHeight: 1 }}>
                {project.num}
              </span>
              <div>
                <p className="text-[#D7E2EA] text-xs sm:text-sm uppercase tracking-widest opacity-60">{project.mood}</p>
                <h3 className="text-[#D7E2EA] font-medium uppercase" style={{ fontSize: 'clamp(1.1rem, 3vw, 2rem)' }}>
                  {project.title}
                </h3>
              </div>
            </div>
            <GhostButton label="View Series" href={`#/gallery/${project.slug}`} />
          </div>

          <div className="flex gap-3 sm:gap-4">
            <div className="flex flex-col gap-3 sm:gap-4" style={{ width: '40%' }}>
              <Pic src={project.col1[0]} alt="" sizes="(min-width: 1024px) 400px, 40vw" className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]" style={{ height: 'clamp(130px, 16vw, 230px)' }} />
              <Pic src={project.col1[1]} alt="" sizes="(min-width: 1024px) 400px, 40vw" className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]" style={{ height: 'clamp(160px, 22vw, 340px)' }} />
            </div>
            <div style={{ width: '60%' }}>
              <Pic src={project.col2} alt="" sizes="(min-width: 1024px) 600px, 60vw" className="w-full h-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectsSection() {
  return (
    <section id="projects" className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-28 pb-24">
      <h2 className={`${heroHeadingClass} font-black uppercase text-center leading-none`} style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
        Projects
      </h2>
      <div className="max-w-5xl mx-auto mt-16">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.num} project={p} index={i} total={PROJECTS.length} />
        ))}
      </div>

      <div id="contact" className="max-w-5xl mx-auto flex flex-col items-center gap-6 mt-16 sm:mt-20 text-center">
        <p className="text-[#D7E2EA]/60 uppercase tracking-widest text-xs sm:text-sm">Get in touch</p>
        <ContactButton />
        <p className="text-[#D7E2EA]/40 text-xs sm:text-sm mt-6">&copy; 2026 Kayshawn Yen &middot; Built for a college application portfolio</p>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div style={{ overflowX: 'clip', background: '#0C0C0C' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutTeaser />
      <ServicesSection />
      <ProjectsSection />
    </div>
  )
}
