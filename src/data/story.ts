import type { PlateLook } from '../engine/stage'
import { SERIES, SERVICES } from './content'

const photo = (name: string) => `/photos/${name}.jpg`

/** One summer night in five scenes. `time` drives the night clock. */
export interface Chapter {
  id: 'booth' | 'cafe' | 'classroom' | 'pool' | 'sunrise'
  numeral: string
  title: string
  time: string
}
export const CHAPTERS: Chapter[] = [
  { id: 'booth', numeral: 'Prologue', title: 'The Phone Booth', time: '19:40' },
  { id: 'cafe', numeral: 'I', title: 'The Café', time: '20:30' },
  { id: 'classroom', numeral: 'II', title: 'Night School', time: '22:00' },
  { id: 'pool', numeral: 'III', title: 'In the Pool', time: '23:30' },
  { id: 'sunrise', numeral: 'Epilogue', title: 'Sunrise', time: '05:10' },
]

export const LINES = {
  booth: ['Late summer. It had just started to rain.', 'Somewhere close by, a phone was ringing.'],
  cafe: 'Every story needs a place to start. Mine is a corner table, a coffee, and whatever the light is doing that evening.',
  bio: "I'm Kayshawn, a photographer with five years behind the camera. I shoot golden-hour bridal editorial on the coast and character photography at conventions. I run K Picture Studio and love building a whole visual style, from the first concept to the final color grade.",
  classroom: 'The school is empty after dark and someone left the windows open. Every desk holds a set of photographs. The lesson on the board is how I make them.',
  pool: 'Nobody locks the pool in summer. It glows from underneath, and the photographs I love most are floating on the water.',
  dive: 'Hold your breath.',
  sunrise: 'By morning the rain was gone. The sky turned the same pink as the last series I shot this year.',
}

/** The lesson on the chalkboard: how a shoot comes together, in the order it happens. */
export const LESSON: [string, string][] = [
  ['Concept', 'A place, a light and a feeling I want the photographs to carry, pinned down before anyone gets dressed.'],
  ['Light', 'I scout for the hour and the angle: golden hour, a window, or one hard lamp in the dark.'],
  ['Direction', 'I direct people like actors in a scene, so the moment looks found rather than posed.'],
  ['Color', 'The grade finishes the story. Every series gets a palette of its own.'],
]

export const MENU = SERVICES

const frames = SERIES.reduce((n, s) => n + s.images.length, 0)
export const RECEIPT: [string, string][] = [
  ['Years behind the camera', '5'],
  ['Series', String(SERIES.length)],
  ['Frames on this site', String(frames)],
  ['Based in', 'Los Angeles'],
  ['Studio', 'K Picture Studio'],
]

/** Photographs floating on the pool. x/y are the float's centre in the stage (0 to 1), w its width. */
export const POOL = [
  { slug: 'golden-hour-devotion', src: photo('angelina-3'), x: 0.24, y: 0.36, w: 0.2, rot: -6 },
  { slug: 'cherry-blossom-reverie', src: photo('fiori-1'), x: 0.53, y: 0.3, w: 0.17, rot: 4 },
  { slug: 'sparks-and-steel', src: photo('sparks-1'), x: 0.8, y: 0.44, w: 0.17, rot: -3 },
  { slug: 'quiet-garden-vows', src: photo('bride-1'), x: 0.36, y: 0.74, w: 0.19, rot: 5 },
  { slug: 'porcelain-and-ribbon', src: photo('lolita-2'), x: 0.68, y: 0.76, w: 0.14, rot: -7 },
]

/** What you see after the dive: three series, large, under the water. */
export const UNDERWATER = [
  { slug: 'reaching-through-shadow', src: photo('persaes-1') },
  { slug: 'winter-light', src: photo('officer-1') },
  { slug: 'midnight-velvet', src: photo('purple-2') },
]

export const CREDITS: [string, string][] = [
  ['Photography & direction', 'Kayshawn Yen'],
  ['Studio', 'K Picture Studio'],
  ['In front of the lens', 'Every model and cosplayer who trusted me'],
  ['Music', '"in the pool" by Kensuke Ushio'],
  ['Inspired by', 'Chainsaw Man - The Movie: Reze Arc'],
  ['Scene backgrounds', 'AI-generated stills (Z-Image-Turbo), not my photographs'],
  ['Made in', 'Los Angeles, 2026'],
  ['Made for', 'A college application'],
]

/**
 * The five sets behind the story. Camera values are small on purpose: a 2.5D plate only holds up while the
 * camera stays close to where the still was taken.
 */
export const PLATES = {
  booth: {
    file: 'booth',
    // the camera ends pushed in on the green phone: that is where "pick up" takes you
    cam: [[0.012, 0, 0], [0, 0.004, 0.18]],
    focus: 0.6,
    frame: [[0.5, 0.5], [0.53, 0.47]],
    zoom: [1.04, 1.4],
    fx: { rain: 0.7, drops: 1, flicker: 1 },
    grade: [[0.96, -0.35, 0.9, 1.1], [0.96, -0.35, 0.9, 1.1]],
  },
  cafe: {
    file: 'cafe',
    // phones start at the window table with the daisies and pan to the counter
    cam: [[-0.012, 0, 0], [0.012, 0.002, 0.08]],
    focus: 0.5,
    frame: [[0.22, 0.45], [0.55, 0.5]],
    zoom: [1.05, 1.08],
    fx: { dust: 0.45 },
    grade: [[1, 0.3, 0.95, 0.95], [1, 0.3, 0.95, 0.95]],
  },
  classroom: {
    file: 'classroom',
    // phones start on the moon in the window and pan to the blank chalkboard; graded to an anime night: dark, deep blue
    cam: [[0.016, 0, 0], [-0.012, 0.003, 0.1]],
    focus: 0.5,
    frame: [[0.2, 0.62], [0.62, 0.6]],
    zoom: [1.05, 1.1],
    fx: { dust: 0.7 },
    grade: [[0.85, -1, 1.1, 1.2], [0.85, -1, 1.1, 1.2]],
  },
  pool: {
    file: 'pool',
    cam: [[0, 0.006, 0], [0, -0.004, 0.12]],
    focus: 0.5,
    frame: [[0.5, 0.5], [0.5, 0.45]],
    zoom: [1.05, 1.1],
    fx: { water: 1 },
    grade: [[1, -0.2, 1, 0.9], [1, -0.2, 1, 0.9]],
  },
  underwater: {
    file: 'underwater',
    cam: [[0, -0.006, 0], [0, 0.008, 0.08]],
    focus: 0.4,
    frame: [[0.5, 0.5], [0.5, 0.52]],
    zoom: [1.06, 1.1],
    fx: { underwater: 1, water: 0.5 },
    grade: [[1.02, -0.3, 1.05, 1.1], [1.02, -0.3, 1.05, 1.1]],
  },
  sunrise: {
    file: 'sunrise',
    cam: [[-0.01, 0, 0], [0.01, 0.004, 0.1]],
    focus: 0.45,
    frame: [[0.5, 0.5], [0.5, 0.5]],
    zoom: [1.05, 1.08],
    fx: { water: 0.7, sparkle: 1, horizon: 0.36 },
    grade: [[0.62, -0.75, 0.7, 1.15], [1.02, 0.3, 1.05, 0.85]],
  },
} satisfies Record<string, PlateLook>

export type PlateId = keyof typeof PLATES
