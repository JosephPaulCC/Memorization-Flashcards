import { store } from '../store/flashcardsStore'
import { CloseIcon } from './Icons'

const steps = [
  { n: '1', title: 'Build decks', desc: 'Add cards one at a time, or paste a list as question=answer.' },
  { n: '2', title: 'Practice', desc: 'Four choices per question. Two correct in a row masters a card; one miss resets it.' },
  { n: '3', title: 'Listen', desc: 'Tap any speaker icon to hear a card. Set question and answer languages in settings.' },
]

export function Onboarding() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#F7F4EC', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '20px 24px 30px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => store.dismissOnboarding()}
            aria-label="Close tutorial"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: '1px solid rgba(38,34,27,.14)',
              background: '#FFFFFF',
              color: '#6E6857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <CloseIcon size={17} />
          </button>
        </div>
        <div style={{ marginTop: '5vh' }}>
          <div
            className="font-display"
            style={{
              width: 58,
              height: 58,
              borderRadius: 17,
              background: 'var(--accent, #C4551C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 26,
            }}
          >
            R
          </div>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 34, letterSpacing: -0.5, color: '#26221B', marginTop: 18 }}>
            Recall
          </div>
          <div style={{ fontSize: 15.5, color: '#6E6857', marginTop: 8, lineHeight: 1.55 }}>
            Flashcards with multiple-choice practice, speech in 9 languages, and mastery tracking — stored on your device.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 30 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span
                  className="font-display"
                  style={{
                    flex: 'none',
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: '#FFFFFF',
                    border: '1px solid rgba(38,34,27,.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    color: 'var(--accent, #C4551C)',
                  }}
                >
                  {s.n}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, color: '#26221B' }}>{s.title}</span>
                  <span style={{ display: 'block', fontSize: 13.5, color: '#6E6857', marginTop: 3, lineHeight: 1.5 }}>{s.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => store.dismissOnboarding()}
          style={{
            marginTop: 'auto',
            width: '100%',
            height: 56,
            borderRadius: 15,
            border: 'none',
            background: 'var(--accent, #C4551C)',
            color: '#FFFFFF',
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 700,
            fontSize: 17,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          Get started
        </button>
      </div>
    </div>
  )
}
