const P = (name: string) => `/photos/${name}.jpg`

export interface Service {
  name: string
  note: string
  desc: string
  /** Shown on the order ticket when the service is picked from the café menu. */
  photo: string | null
}

export const SERVICES: Service[] = [
  { name: 'Portrait Photography', note: 'light, mood, a real personality', photo: P('angelina-1'), desc: "One-on-one sessions built around light, mood, and a subject's real personality, from clean studio setups to golden-hour locations." },
  { name: 'Cosplay & Character', note: 'concept to color grade', photo: P('fiori-3'), desc: 'Full creative direction for convention and character photography: concept, posing, lighting, and color grading built around the costume.' },
  { name: 'Bridal & Editorial', note: 'golden hour, coastline', photo: P('bride-1'), desc: 'Golden-hour bridal and fashion-editorial shoots, planned around location, wardrobe, and a consistent cinematic color story.' },
  { name: 'Graduation & Events', note: 'fast turnaround, careful framing', photo: P('purple-3'), desc: "Portraits and coverage for graduations, meetups, and small events, with a fast turnaround that doesn't cut corners on composition." },
]

export interface Series {
  slug: string
  title: string
  mood: string
  images: string[]
  isNew?: boolean
}

/** Full body of work, grouped by mood rather than subject name. The newest series comes first in the album. */
export const SERIES: Series[] = [
  {
    slug: 'rose-castle',
    title: 'Rose Castle',
    mood: 'A princess in pink roses, falling petals and castle light.',
    images: [P('rose-1'), P('rose-2'), P('rose-3'), P('rose-4')],
    isNew: true,
  },
  {
    slug: 'golden-hour-devotion',
    title: 'Golden Hour Devotion',
    mood: 'Bridal editorial on the coast. Warm light, quiet devotion.',
    images: [P('angelina-1'), P('angelina-2'), P('angelina-3')],
  },
  {
    slug: 'quiet-garden-vows',
    title: 'Quiet Garden Vows',
    mood: 'A bride among roses, dappled afternoon light.',
    images: [P('bride-1'), P('bride-2'), P('bride-group')],
  },
  {
    slug: 'cherry-blossom-reverie',
    title: 'Cherry Blossom Reverie',
    mood: 'Character portraiture under falling petals.',
    images: [P('fiori-1'), P('fiori-2'), P('fiori-3'), P('fiori-4')],
  },
  {
    slug: 'reaching-through-shadow',
    title: 'Reaching Through Shadow',
    mood: 'Dramatic light and a single reaching hand.',
    images: [P('persaes-1'), P('persaes-2')],
  },
  {
    slug: 'winter-light',
    title: 'Winter Light',
    mood: 'A quiet portrait in falling snow.',
    images: [P('officer-1'), P('officer-5')],
  },
  {
    slug: 'sparks-and-steel',
    title: 'Sparks and Steel',
    mood: 'A katana drawn in a shower of sparks.',
    images: [P('sparks-1'), P('officer-4'), P('sparks-2'), P('sparks-3')],
  },
  {
    slug: 'porcelain-and-ribbon',
    title: 'Porcelain and Ribbon',
    mood: 'Soft pastels and doll-like stillness.',
    images: [P('lolita-1'), P('lolita-2'), P('lolita-3')],
  },
  {
    slug: 'midnight-velvet',
    title: 'Midnight Velvet',
    mood: 'Candid convention energy in black and red.',
    images: [P('purple-2'), P('purple-3')],
  },
]

export const seriesBySlug = (slug: string) => SERIES.find((s) => s.slug === slug)

export const CONTACT = {
  email: 'kayshawnyen2005@gmail.com',
  gmailComposeUrl: 'https://mail.google.com/mail/?view=cm&fs=1&to=kayshawnyen2005@gmail.com',
  instagramHandle: '@K_picture_studio',
  instagramUrl: 'https://www.instagram.com/k_picture_studio/',
  phoneDisplay: '(909) 345-4533',
  phoneHref: 'tel:+19093454533',
  location: 'Los Angeles',
}

export const KAYSHAWN_PORTRAIT = P('kayshawn-portrait')
