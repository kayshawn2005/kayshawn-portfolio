import { useState } from 'react'
import { Picture } from '../components/Picture'
import { KAYSHAWN_PORTRAIT } from '../data/content'
import { CHAPTERS, LINES, MENU, RECEIPT } from '../data/story'
import { ChapterCard, NextButton } from './parts'
import { useSeen } from './hooks'

/** The studio's numbers, printed like the café's receipt. */
function Receipt() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4)
  return (
    <div ref={ref} className={`receipt ${seen ? 'is-printed' : ''}`}>
      <p className="receipt-head">K Picture Studio</p>
      <p className="receipt-sub">Table 01, 18:20</p>
      <dl>
        {RECEIPT.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="receipt-foot">Thank you. Come again.</p>
    </div>
  )
}

/** Services as tonight's menu. Picking a dish prints its order ticket: a photograph and what the session is. */
function Menu() {
  const [pick, setPick] = useState(0)
  const item = MENU[pick]
  return (
    <div className="menu">
      <h3 className="panel-title">Tonight&apos;s menu</h3>
      <div className="menu-grid">
        <ul className="menu-list">
          {MENU.map((m, i) => (
            <li key={m.name}>
              <button type="button" className="menu-row" aria-pressed={i === pick} onClick={() => setPick(i)} onMouseEnter={() => setPick(i)}>
                <span className="menu-name">{m.name}</span>
                <span className="menu-note">{m.note}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ticket" key={item.name} aria-live="polite">
          {item.photo ? (
            <Picture src={item.photo} alt={item.name} sizes="(min-width: 900px) 220px, 60vw" develop={false} className="ticket-photo" />
          ) : (
            <div className="ticket-photo is-empty">Photographs coming soon</div>
          )}
          <p className="ticket-order">Order: {item.name}</p>
          <p className="ticket-desc">{item.desc}</p>
        </div>
      </div>
    </div>
  )
}

/** Chapter I: the café. Who I am, and what I shoot. */
export function Cafe() {
  return (
    <section id="cafe" data-plate="cafe" className="chapter">
      <ChapterCard chapter={CHAPTERS[1]} line={LINES.cafe} />
      <div className="chapter-body">
        <article className="panel about" id="about">
          <Picture src={KAYSHAWN_PORTRAIT} alt="Kayshawn Yen" sizes="(min-width: 900px) 260px, 70vw" className="about-photo" />
          <div className="about-text">
            <h3 className="panel-title">The usual table</h3>
            <p>{LINES.bio}</p>
            <Receipt />
          </div>
        </article>
        <article className="panel">
          <Menu />
        </article>
        <NextButton to="classroom">Walk to the school</NextButton>
      </div>
    </section>
  )
}
