import { SERVICES, THEMES } from './content'

const photo = (name: string) => `/photos/${name}.jpg`

/** The site is one summer night, told in five scenes. `time` drives the night clock. */
export interface Chapter {
  id: string
  numeral: string
  title: string
  time: string
}
export const CHAPTERS: Chapter[] = [
  { id: 'prologue', numeral: 'Prologue', title: 'The Phone Booth', time: '19:40' },
  { id: 'cafe', numeral: 'I', title: 'The Café', time: '20:10' },
  { id: 'night-swim', numeral: 'II', title: 'Night Swim', time: '22:10' },
  { id: 'festival', numeral: 'III', title: 'Festival', time: '23:00' },
  { id: 'epilogue', numeral: 'Epilogue', title: 'The Café, After', time: '23:50' },
]

export const NARRATION = {
  prologueBefore: ['Late summer. It had just started to rain.', 'Somewhere nearby, a phone was ringing.'],
  prologueAfter: ['The rain eased off.', 'The night could begin.'],
  cafe: 'Every story needs a place to start. Mine is a corner table, a coffee, and whatever the light happens to be doing that evening.',
  bio: "I'm Kayshawn, a photographer with five years behind the camera. I split my time between two worlds: golden-hour bridal editorial on the coast, and character photography at conventions. I run K Picture Studio and love building a whole visual style, from the first concept to the final color grade.",
  nightSwim:
    'Nobody locks the school gate in summer. The pool glows from underneath, and every photograph floats on the water like a memory you could reach into.',
  festival: 'The fireworks start at eleven. Everyone looks up. I watch the light land on their faces. That is the photograph I keep chasing.',
  epilogue: 'The café stays open late tonight. There are flowers on the table. I will be here.',
}

/** Chapter I: services, printed as tonight's menu. `photo` slides out as an order ticket with the full description. */
export const MENU = [
  { name: 'Portrait Photography', note: 'light · mood · a real personality', photo: photo('angelina-1') },
  { name: 'Cosplay & Character', note: 'concept to color grade', photo: photo('fiori-3') },
  { name: 'Bridal & Editorial', note: 'golden hour · coastline', photo: photo('bride-1') },
  { name: 'Graduation & Events', note: 'fast turnaround, careful framing', photo: photo('purple-3') },
  { name: 'Automotive', note: 'reflections · motion', photo: null },
].map((item, i) => ({ ...item, desc: SERVICES[i].desc }))

const frames = THEMES.reduce((n, t) => n + t.images.length, 0)
export const RECEIPT: [string, string][] = [
  ['Years behind the camera', '5'],
  ['Series', String(THEMES.length)],
  ['Frames on this site', String(frames)],
  ['Based in', 'Los Angeles'],
  ['Studio', 'K Picture Studio'],
]

/** The fable's two worlds. The album groups every series into one of them. */
export const WORLDS = {
  country: { label: 'The Country Mouse', line: 'Golden hour · the coast · quiet vows' },
  city: { label: 'The City Mouse', line: 'Conventions · neon · characters' },
}

/** Chapter II: photographs floating on the pool. x/y are the float's centre in the stage (0–1), w its width. */
export const POOL = [
  { slug: 'golden-hour-devotion', src: photo('angelina-3'), x: 0.24, y: 0.36, w: 0.2, rot: -6 },
  { slug: 'cherry-blossom-reverie', src: photo('fiori-1'), x: 0.53, y: 0.3, w: 0.17, rot: 4 },
  { slug: 'sparks-and-steel', src: photo('sparks-1'), x: 0.8, y: 0.44, w: 0.17, rot: -3 },
  { slug: 'quiet-garden-vows', src: photo('bride-1'), x: 0.36, y: 0.74, w: 0.19, rot: 5 },
  { slug: 'porcelain-and-ribbon', src: photo('lolita-2'), x: 0.68, y: 0.76, w: 0.14, rot: -7 },
]

export const CREDITS: [string, string][] = [
  ['Photography & direction', 'Kayshawn Yen'],
  ['Studio', 'K Picture Studio'],
  ['Color grading', 'Kayshawn Yen'],
  ['In front of the lens', 'Every model and cosplayer who trusted me'],
  ['Music', '“slow summer eve” · Kensuke Ushio'],
  ['Inspired by', 'Chainsaw Man – The Movie: Reze Arc'],
  ['The fable', 'The Town Mouse and the Country Mouse · Aesop'],
  ['Made in', 'Los Angeles, 2026'],
  ['Made for', 'A college application'],
]
