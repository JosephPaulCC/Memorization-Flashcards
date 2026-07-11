import type { Card, DB } from '../lib/types'
import { isMastered } from '../lib/utils'
import { store } from '../store/flashcardsStore'
import { BackChevronIcon, EditIcon, PlusIcon, TrashIcon } from './Icons'
import { ToggleRow } from './Toggle'

function CardRow({ card }: { card: Card }) {
  const mastered = isMastered(card)
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(38,34,27,.1)',
        borderRadius: 14,
        padding: '12px 10px 12px 14px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div dir="auto" style={{ fontSize: 15, fontWeight: 600, color: '#26221B', lineHeight: 1.35, wordBreak: 'break-word' }}>
          {card.q}
        </div>
        <div dir="auto" style={{ fontSize: 13.5, color: '#6E6857', marginTop: 3, lineHeight: 1.35, wordBreak: 'break-word' }}>
          {card.a}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 8,
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: '#9A937F',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#1E8A5A' }}>✓ {card.timesCorrect | 0}</span>
          <span style={{ color: '#C6392C' }}>✗ {card.timesWrong | 0}</span>
          {mastered && (
            <span style={{ background: '#E7F4EC', color: '#14532D', borderRadius: 999, padding: '2.5px 9px', letterSpacing: 0.5 }}>
              MASTERED
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => store.openModal({ type: 'card', mode: 'edit', cardId: card.id }, { q: card.q, a: card.a })}
        aria-label="Edit card"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          border: 'none',
          background: 'rgba(38,34,27,.05)',
          color: '#6E6857',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          touchAction: 'manipulation',
          flex: 'none',
        }}
      >
        <EditIcon size={16} />
      </button>
      <button
        onClick={() => store.openConfirm('card', card.id, 'Delete card?', `"${card.q}" will be removed from this deck.`)}
        aria-label="Delete card"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          border: 'none',
          background: 'rgba(38,34,27,.05)',
          color: '#A8442F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          touchAction: 'manipulation',
          flex: 'none',
        }}
      >
        <TrashIcon size={16} />
      </button>
    </div>
  )
}

export function DeckScreen({ db, deckId }: { db: DB; deckId: string }) {
  const deck = db.decks.find((d) => d.id === deckId)
  if (!deck) return null

  const total = deck.cards.length
  const mastered = deck.cards.filter(isMastered).length
  const remaining = total - mastered
  const pct = total ? Math.round((mastered / total) * 100) : 0
  const folder = db.folders.find((f) => f.id === deck.folderId) ?? null

  let note = ''
  if (total < 4) {
    const need = 4 - total
    note = `Add ${need} more card${need === 1 ? '' : 's'} to practice (minimum 4)`
  } else if (deck.remainingOnly && remaining === 0) {
    note = 'All cards mastered — turn off "Practice remaining only" to review'
  }
  const canPractice = !note

  return (
    <div style={{ padding: '16px 18px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => store.goHome()}
          aria-label="Back"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: 'none',
            background: 'none',
            color: '#26221B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
            marginLeft: -10,
          }}
        >
          <BackChevronIcon />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            dir="auto"
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: '#26221B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {deck.name}
          </div>
          {folder && <div style={{ fontSize: 12, color: '#857E6F', marginTop: 1 }}>{folder.name}</div>}
        </div>
        <button
          onClick={() => store.openModal({ type: 'deck', mode: 'edit', deckId: deck.id }, { name: deck.name, folder: folder ? folder.name : '' })}
          aria-label="Rename deck"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid rgba(38,34,27,.14)',
            background: '#FFFFFF',
            color: '#26221B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <EditIcon />
        </button>
        <button
          onClick={() =>
            store.openConfirm(
              'deck',
              deck.id,
              'Delete deck?',
              `"${deck.name}" and its ${total} card${total === 1 ? '' : 's'} will be deleted. This cannot be undone.`,
            )
          }
          aria-label="Delete deck"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid rgba(38,34,27,.14)',
            background: '#FFFFFF',
            color: '#A8442F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <TrashIcon />
        </button>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid rgba(38,34,27,.12)', borderRadius: 16, padding: 16, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 30, color: '#26221B' }}>
            {pct}%
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right', fontSize: 12.5, color: '#857E6F', lineHeight: 1.5 }}>
            <span style={{ color: '#1E8A5A', fontWeight: 700 }}>{mastered}</span> mastered
            <br />
            <span style={{ color: '#26221B', fontWeight: 700 }}>{remaining}</span> remaining
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(38,34,27,.08)', marginTop: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: 'var(--accent, #C4551C)', width: `${pct}%` }} />
        </div>
        <div style={{ fontSize: 12, color: '#9A937F', marginTop: 8 }}>
          {total} {total === 1 ? 'card' : 'cards'} · mastered = 2 correct in a row
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid rgba(38,34,27,.12)', borderRadius: 16, padding: '2px 16px', marginTop: 12 }}>
        <ToggleRow
          title="Reverse mode"
          description="Prompt with the answer, choose the question"
          checked={deck.reverse}
          onClick={() => store.toggleDeckFlag('reverse')}
          divider
        />
        <ToggleRow
          title="Practice remaining only"
          description="Leave mastered cards out of sessions"
          checked={deck.remainingOnly}
          onClick={() => store.toggleDeckFlag('remainingOnly')}
        />
      </div>

      <button
        onClick={() => store.startSession()}
        className="tap-99"
        style={{
          width: '100%',
          height: 56,
          marginTop: 14,
          borderRadius: 15,
          border: 'none',
          background: canPractice ? 'var(--accent, #C4551C)' : 'rgba(38,34,27,.12)',
          color: canPractice ? '#FFFFFF' : '#9A937F',
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 700,
          fontSize: 17,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        Start practice
      </button>
      {note && <div style={{ fontSize: 12.5, color: '#B4830B', textAlign: 'center', marginTop: 8 }}>{note}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '26px 0 10px' }}>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 700,
            fontSize: 12.5,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: '#857E6F',
          }}
        >
          Cards
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#B9B29F' }}>{total}</span>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => store.openModal({ type: 'bulk' }, { bulk: '' })}
          style={{
            height: 38,
            padding: '0 13px',
            borderRadius: 10,
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
          Bulk add
        </button>
        <button
          onClick={() => store.openModal({ type: 'card', mode: 'new' }, { q: '', a: '' })}
          style={{
            height: 38,
            padding: '0 13px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent, #C4551C)',
            color: '#FFFFFF',
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <PlusIcon size={14} strokeWidth={2.6} />
          Add
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {deck.cards.map((c) => (
          <CardRow key={c.id} card={c} />
        ))}
      </div>
      {deck.cards.length === 0 && (
        <div style={{ textAlign: 'center', color: '#857E6F', fontSize: 14, padding: '22px 10px', lineHeight: 1.5 }}>
          No cards yet. Use <b>Add</b> for one card or <b>Bulk add</b> to paste a list.
        </div>
      )}
    </div>
  )
}
