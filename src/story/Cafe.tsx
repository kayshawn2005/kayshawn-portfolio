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

/** Services as the café's menu card. Picking a dish prints its order ticket: a photograph and what the session is. */
function Menu() {
  const [pick, setPick] = useState(0)
  const item = MENU[pick]
  return (
    <article className="menu-card">
      <header className="menu-head">
        <p>K Picture Studio</p>
        <h3>Menu</h3>
      </header>
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
        {item.photo && <Picture src={item.photo} alt={item.name} sizes="(min-width: 900px) 240px, 70vw" develop={false} className="ticket-photo" />}
        <p className="ticket-order">Order: {item.name}</p>
        <p className="ticket-desc">{item.desc}</p>
      </div>
    </article>
  )
}

/** Chapter I: the café. Who I am, and what I shoot. */
export function Cafe() {
  return (
    <section id="cafe" data-plate="cafe" className="chapter">
      <ChapterCard chapter={CHAPTERS[1]} line={LINES.cafe} />
      <div className="chapter-body">
        {/* things on the café table: a print, a note, the receipt */}
        <div className="table-top" id="about">
          <figure className="print">
            <Picture src={KAYSHAWN_PORTRAIT} alt="Kayshawn Yen" sizes="(min-width: 900px) 300px, 80vw" />
            <figcaption className="print-caption">the usual table</figcaption>
          </figure>
          <article className="note">
            <h3>Hello, I&apos;m Kayshawn.</h3>
            <p>{LINES.bio}</p>
          </article>
          <Receipt />
        </div>
        <Menu />
        <NextButton to="classroom">Walk to the school</NextButton>
      </div>
    </section>
  )
}
