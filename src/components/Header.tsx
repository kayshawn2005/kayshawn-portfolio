import { useSyncExternalStore } from 'react'
import { FilmStrip, Pause, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { music } from '../lib/music'
import { director, songTimeForScroll } from '../story/director'
import { useMusicOn } from '../story/hooks'

const useFilm = () => useSyncExternalStore((fn) => director.subscribe(fn), () => director.film, () => false)

/** Fixed top bar. On the story it also carries "follow the music", which lets the song walk you through the night. */
export function Header({ page }: { page: 'story' | 'album' }) {
  const on = useMusicOn()
  const film = useFilm()

  const toggleFilm = () => {
    if (film) return director.setFilm(false)
    // start the song from wherever the visitor already is, so nothing jumps
    if (!on) void music.enable()
    music.seek(songTimeForScroll(window.scrollY))
    director.setFilm(true)
  }

  return (
    <header className="site-header">
      <a className="brand" href="#/">
        Kayshawn Yen
      </a>
      <nav className="site-nav" aria-label="Pages">
        <a href="#/" aria-current={page === 'story' ? 'page' : undefined}>
          Story
        </a>
        <a href="#/album" aria-current={page === 'album' ? 'page' : undefined}>
          Album
        </a>
      </nav>
      <div className="header-actions">
        {page === 'story' && (
          <button type="button" className="chip" aria-pressed={film} onClick={toggleFilm}>
            {film ? <Pause size={15} weight="fill" aria-hidden="true" /> : <FilmStrip size={15} aria-hidden="true" />}
            <span className="chip-label">{film ? 'Stop following' : 'Follow the music'}</span>
          </button>
        )}
        <button type="button" className="chip" aria-pressed={on} onClick={() => music.toggle()} aria-label={on ? 'Mute music' : 'Play music'}>
          {on ? <SpeakerHigh size={15} aria-hidden="true" /> : <SpeakerSlash size={15} aria-hidden="true" />}
          <span className="chip-label">{on ? 'Sound on' : 'Sound off'}</span>
        </button>
      </div>
    </header>
  )
}
