# Kayshawn Yen — Portfolio

Personal photography portfolio for a college application: bridal editorial and
character/cosplay photography, built as a full multi-page site.

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [lucide-react](https://lucide.dev/) for icons
- Hand-built scroll/hover animations (fade-in-on-scroll, magnetic hover, marquee, sticky-scaling cards, per-character scroll reveal) sharing one scroll listener — no animation library dependency
- Browser-native motion: View Transitions API, CSS scroll-driven animations, Web Audio

## Pages

- `/` — hero, image marquee, about teaser, services, featured series
- `#/gallery` (optionally `#/gallery/<slug>`) — every shoot, grouped by mood/theme
- `#/about` — full bio
- `#/contact` — email, Instagram, phone, location

Routing is a small hand-rolled hash router in `src/App.tsx` (no react-router — the
site is small enough that it isn't needed).

## Development

```bash
npm install
npm run dev      # start local dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build locally
```

## Content

Site copy and image paths live in `src/data/content.ts`. Images live in
`public/photos/`.

### Adding photos

Put the JPG in `public/photos/`, then run `node scripts/optimize-images.mjs`
(needs ffmpeg). It writes AVIF/WebP sizes to `public/photos/opt/` and updates
`src/data/photos.gen.ts` (dimensions + blurred placeholders).

## Motion & sound

- **Soundtrack**: "slow summer eve" by Kensuke Ushio (`public/audio/slow-summer-eve.m4a`).
  On by default: browsers only allow sound after a click, so the site opens on an
  entry screen whose Enter button starts it; it fades in over 2 s and the nav button
  mutes it. A visitor who mutes stays muted on their next visit. `BPM` and
  `DOWNBEAT` in `src/lib/music.ts` were measured from this track; update them if
  the song changes.
- **Hero reel**: 8 photos cut on every bar of the song (`REEL_WIDE` / `REEL_TALL`
  in `src/data/content.ts`; `pos` is each photo's focal point). Phones get
  portrait photos.
- **Atmosphere**: one fixed soft-light layer grades every page from golden hour at
  the top to blue hour at the bottom, with film grain.
- **Develop**: photos start over-exposed and develop once loaded and on screen.
- **Transitions**: pages open like an aperture; photos morph into the lightbox.
  Browsers without View Transitions switch instantly.
- **Series particles**: petals, sparks, dust or snow over the matching gallery
  series (`particles` in `THEMES`).
- Everything respects the system "reduce motion" setting.
