# Kayshawn Yen — Portfolio

Personal photography portfolio for a college application: bridal editorial and
character/cosplay photography, built as a full multi-page site.

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [lucide-react](https://lucide.dev/) for icons
- Hand-built scroll/hover animations (fade-in-on-scroll, magnetic hover, marquee, sticky-scaling cards, per-character scroll reveal) — no animation library dependency

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
