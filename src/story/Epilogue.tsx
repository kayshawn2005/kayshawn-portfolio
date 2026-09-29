import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { ChapterHead } from './ChapterHead'
import { prefersReducedMotion } from '../components/FadeIn'
import { CREDITS, NARRATION } from '../data/story'

/**
 * The last shot: the café table, flowers in a glass, a coffee still steaming.
 * The scene is wide and cropped to fit (slice), so the table runs edge to edge while the props keep their size;
 * the lamp light is a CSS glow on the wrapper so it never clips at the SVG bounds.
 */
function CafeTable() {
  return (
    <svg className="cafe-table" viewBox="0 0 3000 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 196 H3000" stroke="#6B4A33" strokeWidth="3" />
      <path d="M0 200 H3000 V220 H0 Z" fill="#1E140D" />
      <g transform="translate(1186 0)">
        {/* glass with three daisies */}
        <path d="M232 196 L238 142 H270 L276 196 Z" fill="rgba(215,226,234,.08)" stroke="rgba(215,226,234,.45)" strokeWidth="1.5" />
        {[
          [246, 150, 236, 92],
          [256, 150, 262, 76],
          [264, 150, 286, 98],
        ].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <path d={`M${x1} ${y1} Q${(x1 + x2) / 2 + (i - 1) * 6} ${(y1 + y2) / 2} ${x2} ${y2}`} fill="none" stroke="#6E8B4E" strokeWidth="1.6" />
            <g transform={`translate(${x2} ${y2})`}>
              {Array.from({ length: 10 }, (_, k) => (
                <ellipse key={k} cx="0" cy="-7" rx="2.4" ry="6.4" fill="#F4F1EA" transform={`rotate(${k * 36})`} />
              ))}
              <circle r="3.4" fill="#F2B544" />
            </g>
          </g>
        ))}
        {/* coffee cup with steam */}
        <path d="M338 170 H384 V186 Q384 196 372 196 H350 Q338 196 338 186 Z" fill="#E9E2D6" />
        <path d="M384 174 Q396 174 396 181 Q396 188 384 188" fill="none" stroke="#E9E2D6" strokeWidth="3" />
        <ellipse cx="361" cy="196" rx="34" ry="3.5" fill="#E9E2D6" opacity="0.5" />
        {[350, 361, 372].map((x, i) => (
          <path key={x} className="steam" style={{ animationDelay: `${-i * 1.1}s` }} d={`M${x} 164 q-6 -10 0 -20 q6 -10 0 -20`} fill="none" stroke="rgba(244,241,234,.45)" strokeWidth="2" strokeLinecap="round" />
        ))}
      </g>
    </svg>
  )
}

/** Epilogue: back at the café. Credits roll past the table; "Start over" brings the rain back. */
export function Epilogue() {
  const startOver = () => {
    window.dispatchEvent(new Event('story:restart'))
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }

  return (
    <section id="epilogue" className="chapter epilogue">
      <div className="epilogue-roll">
        <ChapterHead id="epilogue" tone="warm" />
        <p className="story-narration story-narration-lg">{NARRATION.epilogue}</p>
        <div className="credits">
          <p className="credits-title">Slow Summer Eve</p>
          <p className="credits-sub">a photography portfolio by Kayshawn Yen</p>
          <dl>
            {CREDITS.map(([role, who]) => (
              <div key={role}>
                <dt>{role}</dt>
                <dd>{who}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="credits-end">
          <button type="button" className="story-button" onClick={startOver}>
            <RotateCcw size={16} /> Start over
          </button>
          <a href="#/gallery" className="story-button is-ghost">
            See the whole album <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="credits-fine">&copy; 2026 Kayshawn Yen · Built for a college application portfolio</p>
      </div>
      <div className="epilogue-table">
        <CafeTable />
      </div>
    </section>
  )
}
