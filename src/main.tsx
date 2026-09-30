import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Latin subsets only: the site is in English, so the Japanese glyph files never ship.
import '@fontsource/shippori-mincho/latin-500.css'
import '@fontsource/shippori-mincho/latin-600.css'
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-700.css'
import '@fontsource/caveat/latin-500.css'
import './styles/base.css'
import './styles/story.css'
import './styles/album.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
