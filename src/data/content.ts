import type { ParticleKind } from '../components/SeriesParticles'

const P = (name: string) => `/photos/${name}.jpg`

export interface Service {
  num: string
  name: string
  desc: string
}

export const SERVICES: Service[] = [
  { num: '01', name: 'Portrait Photography', desc: "One-on-one sessions built around light, mood, and a subject's real personality — from clean studio setups to golden-hour locations." },
  { num: '02', name: 'Cosplay & Character Work', desc: 'Full creative direction for convention and character photography — concept, posing, lighting, and color grading built around the costume.' },
  { num: '03', name: 'Bridal & Editorial', desc: 'Golden-hour bridal and fashion-editorial shoots, planned around location, wardrobe, and a consistent cinematic color story.' },
  { num: '04', name: 'Graduation & Events', desc: "Portraits and coverage for graduations, meetups, and small events, with a fast turnaround that doesn't cut corners on composition." },
  { num: '05', name: 'Automotive', desc: 'Detail and environmental shots for cars — controlled reflections, motion, and color grading suited to the subject.' },
]

export interface Theme {
  slug: string
  title: string
  mood: string
  images: string[]
  /** The series' own "weather", drawn lightly over its photos in the gallery. */
  particles?: ParticleKind
  /** Which of the fable's two worlds the series belongs to (Chapter II). */
  world: 'country' | 'city'
}

/** Full body of work, grouped by mood/theme rather than subject name. */
export const THEMES: Theme[] = [
  {
    slug: 'golden-hour-devotion',
    world: 'country',
    title: 'Golden Hour Devotion',
    mood: 'Bridal editorial on the coast — warm light, quiet devotion.',
    images: [P('angelina-1'), P('angelina-2'), P('angelina-3')],
    particles: 'dust',
  },
  {
    slug: 'quiet-garden-vows',
    world: 'country',
    title: 'Quiet Garden Vows',
    mood: 'A bride among roses, dappled afternoon light.',
    images: [P('bride-1'), P('bride-2'), P('bride-group')],
    particles: 'petals',
  },
  {
    slug: 'cherry-blossom-reverie',
    world: 'city',
    title: 'Cherry Blossom Reverie',
    mood: 'Character portraiture under falling petals.',
    images: [P('fiori-1'), P('fiori-2'), P('fiori-3'), P('fiori-4')],
    particles: 'sakura',
  },
  {
    slug: 'reaching-through-shadow',
    world: 'city',
    title: 'Reaching Through Shadow',
    mood: 'Dramatic light and a single reaching hand.',
    images: [P('persaes-1'), P('persaes-2')],
  },
  {
    slug: 'winter-light',
    world: 'city',
    title: 'Winter Light',
    mood: 'A quiet portrait in falling snow.',
    images: [P('officer-1'), P('officer-5')],
    particles: 'snow',
  },
  {
    slug: 'sparks-and-steel',
    world: 'city',
    title: 'Sparks and Steel',
    mood: 'A katana drawn in a shower of sparks.',
    images: [P('sparks-1'), P('officer-4'), P('sparks-2'), P('sparks-3')],
    particles: 'sparks',
  },
  {
    slug: 'porcelain-and-ribbon',
    world: 'city',
    title: 'Porcelain and Ribbon',
    mood: 'Soft pastels and doll-like stillness.',
    images: [P('lolita-1'), P('lolita-2'), P('lolita-3')],
  },
  {
    slug: 'midnight-velvet',
    world: 'city',
    title: 'Midnight Velvet',
    mood: 'Candid convention energy in black and red.',
    images: [P('purple-2'), P('purple-3')],
  },
]

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
