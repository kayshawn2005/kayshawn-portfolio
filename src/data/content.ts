const P = (name: string) => `/photos/${name}.jpg`

export const MARQUEE_ROW1 = [
  P('angelina-1'),
  P('angelina-2'),
  P('angelina-3'),
  P('bride-1'),
  P('bride-2'),
  P('bride-group'),
  P('lolita-1'),
  P('lolita-2'),
  P('lolita-3'),
  P('persaes-1'),
  P('persaes-2'),
]

export const MARQUEE_ROW2 = [
  P('fiori-1'),
  P('fiori-2'),
  P('fiori-3'),
  P('fiori-4'),
  P('officer-1'),
  P('officer-5'),
  P('officer-4'),
  P('purple-2'),
  P('purple-3'),
]

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
}

/** Full body of work, grouped by mood/theme rather than subject name. */
export const THEMES: Theme[] = [
  {
    slug: 'golden-hour-devotion',
    title: 'Golden Hour Devotion',
    mood: 'Bridal editorial on the coast — warm light, quiet devotion.',
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
    slug: 'steel-and-winter-light',
    title: 'Steel and Winter Light',
    mood: 'A kneeling figure, fog, and cold morning light.',
    images: [P('officer-1'), P('officer-5'), P('officer-4')],
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

export interface FeaturedProject {
  num: string
  slug: string
  title: string
  mood: string
  col1: [string, string]
  col2: string
}

/** 3 featured series on the home page — themed, not named. */
export const PROJECTS: FeaturedProject[] = [
  {
    num: '01',
    slug: 'golden-hour-devotion',
    title: 'Golden Hour Devotion',
    mood: 'Bridal editorial, coastline, golden hour.',
    col1: [P('angelina-1'), P('angelina-2')],
    col2: P('angelina-3'),
  },
  {
    num: '02',
    slug: 'cherry-blossom-reverie',
    title: 'Cherry Blossom Reverie',
    mood: 'Character portraiture under falling petals.',
    col1: [P('fiori-1'), P('fiori-3')],
    col2: P('fiori-4'),
  },
  {
    num: '03',
    slug: 'steel-and-winter-light',
    title: 'Steel and Winter Light',
    mood: 'A kneeling figure, fog, and cold morning light.',
    col1: [P('officer-1'), P('officer-5')],
    col2: P('officer-4'),
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
