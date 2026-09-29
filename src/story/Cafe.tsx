import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ChapterHead } from './ChapterHead'
import { AnimatedText } from '../components/AnimatedText'
import { Magnet } from '../components/Magnet'
import { Pic } from '../components/Lightbox'
import { Picture } from '../components/Picture'
import { KAYSHAWN_PORTRAIT } from '../data/content'
import { MENU, NARRATION, RECEIPT } from '../data/story'

/** A receipt that prints line by line the first time it scrolls into view. */
function Receipt() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [printed, setPrinted] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPrinted(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`receipt ${printed ? 'is-printed' : ''}`}>
      <p className="receipt-shop">K Picture Studio</p>
      <p className="receipt-meta">Table 01 · Order #0826 · 20:10</p>
      <dl>
        {RECEIPT.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="receipt-total">
        <span>Total</span>
        <span>One story</span>
      </p>
      <p className="receipt-thanks">thank you · come again</p>
      <div className="receipt-barcode" aria-hidden="true" />
    </div>
  )
}

/** Chapter I: who I am, over coffee. Services are tonight's menu; each order slides out a ticket. */
export function Cafe() {
  const [ticket, setTicket] = useState<number | null>(null)
  const item = ticket === null ? null : MENU[ticket]

  return (
    <section id="cafe" className="chapter cafe">
      <div className="cafe-lamp" aria-hidden="true" />
      <div className="chapter-inner">
        <ChapterHead id="cafe" tone="warm" />
        <AnimatedText text={NARRATION.cafe} className="story-narration story-narration-lg" />

        <div className="cafe-grid">
          <figure className="cafe-polaroid">
            <Magnet padding={120} strength={4}>
              <div className="polaroid">
                <span className="polaroid-pin" aria-hidden="true" />
                <Pic src={KAYSHAWN_PORTRAIT} alt="Kayshawn Yen, photographer" sizes="320px" className="w-full" />
                <figcaption>the usual table · K Picture Studio</figcaption>
              </div>
            </Magnet>
          </figure>

          <div className="cafe-text">
            <p className="cafe-bio">{NARRATION.bio}</p>

            <div className="menu-board" onMouseLeave={() => setTicket(null)}>
              <p className="menu-eyebrow">K Picture Studio</p>
              <h3 className="menu-title">Tonight&apos;s Menu</h3>
              <ul>
                {MENU.map((m, i) => (
                  <li key={m.name}>
                    <button
                      type="button"
                      className={`menu-row ${ticket === i ? 'is-open' : ''}`}
                      aria-expanded={ticket === i}
                      onMouseEnter={() => setTicket(i)}
                      onFocus={() => setTicket(i)}
                      onClick={() => setTicket((t) => (t === i ? null : i))}
                    >
                      <span className="menu-name">{m.name}</span>
                      <span className="menu-dots" aria-hidden="true" />
                      <span className="menu-note">{m.note}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className={`menu-ticket ${item ? 'is-out' : ''}`} aria-live="polite">
                {item && (
                  <>
                    {item.photo ? (
                      <Picture key={item.photo} src={item.photo} alt={item.name} sizes="240px" develop={false} className="menu-ticket-photo" />
                    ) : (
                      <p className="menu-ticket-empty">Photos on request</p>
                    )}
                    <p className="menu-ticket-caption">
                      Order #{String((ticket ?? 0) + 1).padStart(2, '0')} · {item.name}
                    </p>
                    <p className="menu-ticket-desc">{item.desc}</p>
                  </>
                )}
              </div>
            </div>

            <a href="#/about" className="story-link">
              Read the full story <ArrowUpRight size={16} />
            </a>
          </div>

          <Receipt />
        </div>
      </div>
    </section>
  )
}
