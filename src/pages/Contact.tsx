import { useEffect, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { FadeIn } from '../components/FadeIn'
import { ContactButton } from '../components/Buttons'
import { CONTACT } from '../data/content'

const heroHeadingClass = 'bg-gradient-to-b from-[#646973] to-[#BBCCD7] bg-clip-text text-transparent'

function ContactRow({ label, value, href, external }: { label: string; value: ReactNode; href?: string; external?: boolean }) {
  const inner = (
    <div className="flex justify-between items-center gap-6 py-6 sm:py-8 border-b border-white/10 group">
      <span className="text-[#D7E2EA]/50 uppercase text-xs sm:text-sm tracking-widest flex-shrink-0">{label}</span>
      <span
        className="text-[#D7E2EA] font-medium text-right flex items-center gap-3 transition-opacity duration-200 group-hover:opacity-70"
        style={{ fontSize: 'clamp(1rem, 2.6vw, 1.75rem)' }}
      >
        {value}
        {href && <ArrowUpRight size={18} />}
      </span>
    </div>
  )
  if (!href) return inner
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="block">
      {inner}
    </a>
  )
}

export function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ overflowX: 'clip', background: '#0C0C0C' }}>
      <div className="px-5 sm:px-8 md:px-10 pt-28 md:pt-36 pb-16 md:pb-24 max-w-2xl mx-auto flex flex-col items-center">
        <FadeIn className="text-center">
          <h1 className={`${heroHeadingClass} font-black uppercase leading-none tracking-tight`} style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
            Contact
          </h1>
          <p className="text-[#D7E2EA]/60 mt-4 max-w-md mx-auto" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)' }}>
            Got a shoot in mind, bridal, cosplay, or otherwise? Reach out — i&apos;m based in Los Angeles and always up for a new concept.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="w-full mt-14 md:mt-16" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <ContactRow label="Email" value={CONTACT.email} href={CONTACT.gmailComposeUrl} external />
          <ContactRow label="Instagram" value={CONTACT.instagramHandle} href={CONTACT.instagramUrl} external />
          <ContactRow label="Phone" value={CONTACT.phoneDisplay} href={CONTACT.phoneHref} />
          <ContactRow label="Location" value={CONTACT.location} />
        </FadeIn>

        <FadeIn delay={0.2} className="mt-14 md:mt-16">
          <ContactButton label="Email Me" href={CONTACT.gmailComposeUrl} external />
        </FadeIn>

        <p className="text-[#D7E2EA]/40 text-xs sm:text-sm mt-16">&copy; 2026 Kayshawn Yen &middot; Built for a college application portfolio</p>
      </div>
    </div>
  )
}
