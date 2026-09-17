import { ArrowUpRight } from 'lucide-react'

interface ContactButtonProps {
  label?: string
  href?: string
  external?: boolean
}

export function ContactButton({ label = 'Contact Me', href = '#/contact', external = false }: ContactButtonProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-2 rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base text-white font-medium uppercase tracking-widest transition-transform duration-200 hover:scale-[1.03]"
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: '0px 4px 4px rgba(181,1,167,0.25), 4px 4px 12px #7721B1 inset',
        outline: '2px solid white',
        outlineOffset: '-3px',
      }}
    >
      {label}
      <ArrowUpRight size={16} />
    </a>
  )
}

interface GhostButtonProps {
  label?: string
  href?: string
}

export function GhostButton({ label = 'View Series', href = '#projects' }: GhostButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base transition-colors duration-200 hover:bg-[#D7E2EA]/10"
    >
      {label}
    </a>
  )
}
