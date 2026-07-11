import type { DB, Session, Settings, Turn } from '../lib/types'
import { optLang, promptLang } from '../lib/utils'
import { store } from '../store/flashcardsStore'
import { BackChevronIcon, EditIcon, FwdChevronIcon, HiddenEyeIcon, SettingsIcon, SpeakerIcon, TrashIcon } from './Icons'

const LINE = 'rgba(38,34,27,.16)'

function OptionButton({ turn, index, vi, settings }: { turn: Turn; index: number; vi: number; settings: Settings }) {
  const answered = turn.sel != null
  let bg = '#FFFFFF'
  let bd = LINE
  let fg = '#26221B'
  let dim = 1
  let weight = 500
  if (answered) {
    if (index === turn.correctIdx) {
      bg = '#E7F4EC'
      bd = '#1E8A5A'
      fg = '#14532D'
      weight = 700
    } else if (index === turn.sel) {
      bg = '#FBEAE8'
      bd = '#C6392C'
      fg = '#7F1D1D'
      weight = 600
    } else {
      dim = 0.5
    }
  }
  const text = turn.options[index]
  return (
    <button
      dir="auto"
      onClick={() => store.pick(vi, index)}
      className="tap-985"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        minHeight: 'var(--osize, 60px)',
        padding: '12px 10px 12px 16px',
        borderRadius: 14,
        border: `2px solid ${bd}`,
        background: bg,
        color: fg,
        opacity: dim,
        fontSize: 'var(--otext, 16px)',
        fontWeight: weight,
        textAlign: 'left',
        touchAction: 'manipulation',
        cursor: 'pointer',
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.35, wordBreak: 'break-word' }}>{text}</span>
      <span
        onClick={(e) => {
          e.stopPropagation()
          store.speak(text, optLang(settings, turn.rev))
        }}
        role="button"
        aria-label="Speak option"
        style={{
          flex: 'none',
          width: 38,
          height: 38,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#857E6F',
          background: 'rgba(38,34,27,.06)',
        }}
      >
        <SpeakerIcon size={17} arcs={1} />
      </span>
    </button>
  )
}

export function SessionScreen({ db, sess, viewIdx, revealed }: { db: DB; sess: Session; viewIdx: number; revealed: boolean }) {
  const li = sess.turns.length - 1
  const vi = Math.max(0, Math.min(li, viewIdx))
  const t = sess.turns[vi]
  if (!t) return null
  const reviewing = vi < li
  const total = sess.turns.length + sess.queue.length
  const hiddenNow = vi === li && t.sel == null && !revealed
  const turnSkipped = reviewing && t.skipped && t.sel == null
  const isLiveView = !reviewing
  const sessDeck = db.decks.find((d) => d.id === sess.deckId)
  const liveCard = sessDeck ? sessDeck.cards.find((c) => c.id === t.cardId) : null

  const histNote =
    t.sel != null ? 'Reviewing — read-only' : t.skipped && !sess.answered[t.cardId] ? 'Skipped earlier — you can answer it' : 'Reviewing — read-only'

  const showSkip = !reviewing && t.sel == null
  const showNext = !reviewing && t.sel != null && t.result === 'wrong'
  const backOp = vi > 0 ? 1 : 0.35
  const fwdOp = reviewing ? 1 : 0.35

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '14px 16px calc(18px + env(safe-area-inset-bottom))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => store.finishSession()}
          style={{
            height: 40,
            padding: '0 13px',
            borderRadius: 11,
            border: '1px solid rgba(38,34,27,.16)',
            background: '#FFFFFF',
            color: '#26221B',
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          End session
        </button>
        <div
          dir="auto"
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: '#857E6F',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {sessDeck ? sessDeck.name : ''}
        </div>
        <button
          onClick={() => store.openModal({ type: 'settings' })}
          aria-label="Settings"
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            border: '1px solid rgba(38,34,27,.16)',
            background: '#FFFFFF',
            color: '#26221B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <SettingsIcon size={18} />
        </button>
      </div>

      {reviewing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#F6EDD5',
            border: '1px solid #DFC98C',
            color: '#7A5E10',
            borderRadius: 12,
            padding: '7px 8px 7px 12px',
            marginTop: 12,
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          <span style={{ flex: 1 }}>{histNote}</span>
          <button
            onClick={() => store.goView(sess.turns.length - 1)}
            style={{
              height: 32,
              padding: '0 11px',
              borderRadius: 9,
              border: '1px solid #DFC98C',
              background: '#FFFFFF',
              color: '#7A5E10',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Current →
          </button>
        </div>
      )}

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(38,34,27,.12)',
          borderRadius: 18,
          padding: '16px 16px 18px',
          marginTop: 14,
          boxShadow: '0 1px 2px rgba(38,34,27,.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span
            style={{
              fontFamily: "'Bricolage Grotesque',sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: '#9A937F',
              textTransform: 'uppercase',
            }}
          >
            Question {vi + 1} of {total}
          </span>
          {turnSkipped && (
            <span
              style={{
                fontFamily: "'Bricolage Grotesque',sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.8,
                background: '#F6EDD5',
                color: '#7A5E10',
                borderRadius: 999,
                padding: '2.5px 8px',
              }}
            >
              SKIPPED
            </span>
          )}
          <span style={{ flex: 1 }} />
          {isLiveView && (
            <>
              <button
                onClick={() => {
                  if (liveCard) store.openModal({ type: 'card', mode: 'edit', cardId: liveCard.id }, { q: liveCard.q, a: liveCard.a })
                }}
                aria-label="Edit this card"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: 'none',
                  background: 'rgba(38,34,27,.05)',
                  color: '#6E6857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                <EditIcon size={14} />
              </button>
              <button
                onClick={() => store.openConfirm('card', t.cardId, 'Delete card?', 'This card will be removed. The session moves on immediately.')}
                aria-label="Delete this card"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: 'none',
                  background: 'rgba(38,34,27,.05)',
                  color: '#A8442F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                <TrashIcon size={14} />
              </button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div
            dir="auto"
            style={{
              flex: 1,
              fontSize: 'var(--qsize, 23px)',
              fontWeight: 650,
              lineHeight: 1.32,
              color: '#26221B',
              wordBreak: 'break-word',
              minHeight: 60,
            }}
          >
            {t.prompt}
          </div>
          <button
            onClick={() => store.speak(t.prompt, promptLang(db.settings, t.rev))}
            aria-label="Speak question"
            className="tap-94"
            style={{
              flex: 'none',
              width: 44,
              height: 44,
              borderRadius: 12,
              border: 'none',
              background: 'color-mix(in srgb, var(--accent, #C4551C) 12%, #FFFFFF)',
              color: 'var(--accent, #C4551C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <SpeakerIcon size={20} arcs={2} />
          </button>
        </div>
      </div>

      <div
        onClick={() => store.revealOptions()}
        style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 14, minHeight: 300 }}
      >
        {hiddenNow && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed rgba(38,34,27,.22)',
              borderRadius: 16,
              background: 'rgba(38,34,27,.03)',
              cursor: 'pointer',
            }}
          >
            <div style={{ textAlign: 'center', color: '#857E6F', padding: 20 }}>
              <HiddenEyeIcon />
              <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 8 }}>Tap to show options</div>
            </div>
          </div>
        )}
        <div style={{ visibility: hiddenNow ? 'hidden' : 'visible', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {t.options.map((_, i) => (
            <OptionButton key={i} turn={t} index={i} vi={vi} settings={db.settings} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <button
          onClick={() => store.goView(vi - 1)}
          aria-label="Previous turn"
          style={{
            flex: 'none',
            width: 52,
            height: 52,
            borderRadius: 14,
            border: '1px solid rgba(38,34,27,.16)',
            background: '#FFFFFF',
            color: '#26221B',
            opacity: backOp,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <BackChevronIcon size={20} />
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {showSkip && (
            <button
              onClick={() => store.skipTurn()}
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                border: '1.5px solid rgba(38,34,27,.2)',
                background: '#FFFFFF',
                color: '#26221B',
                fontFamily: "'Bricolage Grotesque',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              Skip
            </button>
          )}
          {showNext && (
            <button
              onClick={() => store.nextTurn()}
              className="tap-99"
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                border: 'none',
                background: 'var(--accent, #C4551C)',
                color: '#FFFFFF',
                fontFamily: "'Bricolage Grotesque',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              Next
            </button>
          )}
        </div>
        <button
          onClick={() => store.goView(vi + 1)}
          aria-label="Next turn"
          style={{
            flex: 'none',
            width: 52,
            height: 52,
            borderRadius: 14,
            border: '1px solid rgba(38,34,27,.16)',
            background: '#FFFFFF',
            color: '#26221B',
            opacity: fwdOp,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <FwdChevronIcon size={20} />
        </button>
      </div>
    </div>
  )
}
