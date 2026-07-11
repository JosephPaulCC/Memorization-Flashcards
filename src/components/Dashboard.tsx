import type { DB, Deck, Folder } from '../lib/types'
import { fmtTime, isMastered, streakNow } from '../lib/utils'
import { store } from '../store/flashcardsStore'
import { FlameIcon, FolderIcon, PlusIcon, SearchIcon, SettingsIcon, TrashIcon } from './Icons'

function deckStats(deck: Deck) {
  const total = deck.cards.length
  const mastered = deck.cards.filter(isMastered).length
  const pct = total ? Math.round((mastered / total) * 100) : 0
  return { total, mastered, remaining: total - mastered, pct }
}

function deckSubLabel(deck: Deck) {
  const { total, mastered, remaining } = deckStats(deck)
  return `${total} ${total === 1 ? 'card' : 'cards'} · ${mastered} mastered · ${remaining} remaining`
}

function SearchDeckRow({ deck }: { deck: Deck }) {
  return (
    <button
      onClick={() => store.openDeck(deck.id)}
      className="tap-99"
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#FFFFFF',
        border: '1px solid rgba(38,34,27,.12)',
        borderRadius: 14,
        padding: '13px 15px',
        cursor: 'pointer',
        touchAction: 'manipulation',
        display: 'block',
      }}
    >
      <div dir="auto" style={{ fontSize: 15.5, fontWeight: 650, color: '#26221B' }}>
        {deck.name}
      </div>
      <div style={{ fontSize: 12.5, color: '#857E6F', marginTop: 3 }}>{deckSubLabel(deck)}</div>
    </button>
  )
}

function CardHitRow({ q, a, deckName, onOpen }: { q: string; a: string; deckName: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="tap-99"
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#FFFFFF',
        border: '1px solid rgba(38,34,27,.12)',
        borderRadius: 14,
        padding: '13px 15px',
        cursor: 'pointer',
        touchAction: 'manipulation',
        display: 'block',
      }}
    >
      <div dir="auto" style={{ fontSize: 14.5, fontWeight: 600, color: '#26221B', lineHeight: 1.35 }}>
        {q}
      </div>
      <div dir="auto" style={{ fontSize: 13, color: '#6E6857', marginTop: 2, lineHeight: 1.35 }}>
        {a}
      </div>
      <div
        style={{
          display: 'inline-block',
          marginTop: 7,
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: 0.5,
          color: '#857E6F',
          background: 'rgba(38,34,27,.06)',
          borderRadius: 999,
          padding: '3px 9px',
        }}
      >
        {deckName}
      </div>
    </button>
  )
}

function DeckListRow({ deck }: { deck: Deck }) {
  const { pct } = deckStats(deck)
  return (
    <button
      onClick={() => store.openDeck(deck.id)}
      className="tap-99"
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#FFFFFF',
        border: '1px solid rgba(38,34,27,.12)',
        borderRadius: 16,
        padding: '14px 16px',
        cursor: 'pointer',
        touchAction: 'manipulation',
        display: 'block',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          dir="auto"
          style={{
            flex: 1,
            fontSize: 16.5,
            fontWeight: 650,
            color: '#26221B',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {deck.name}
        </span>
        <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--accent, #C4551C)' }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(38,34,27,.08)', margin: '10px 0 8px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: 'var(--accent, #C4551C)', width: `${pct}%` }} />
      </div>
      <div style={{ fontSize: 12.5, color: '#857E6F' }}>{deckSubLabel(deck)}</div>
    </button>
  )
}

function FolderSection({ folder, decks }: { folder: Folder; decks: Deck[] }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 10px' }}>
        <FolderIcon />
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
          {folder.name}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#B9B29F' }}>
          {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
        </span>
        <span style={{ flex: 1 }} />
        <button
          onClick={() =>
            store.openConfirm('folder', folder.id, 'Delete folder?', `"${folder.name}" will be removed. Its decks move to Ungrouped.`)
          }
          aria-label="Delete folder"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: 'none',
            background: 'none',
            color: '#B9B29F',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {decks.map((d) => (
          <DeckListRow key={d.id} deck={d} />
        ))}
      </div>
      {decks.length === 0 && <div style={{ fontSize: 13, color: '#B9B29F', padding: '4px 2px' }}>No decks in this folder</div>}
    </div>
  )
}

export function Dashboard({ db, search }: { db: DB; search: string }) {
  const term = search.trim().toLowerCase()
  const searching = term.length > 0

  let sDecks: Deck[] = []
  const sCards: { q: string; a: string; deckName: string; deckId: string }[] = []
  if (searching) {
    sDecks = db.decks.filter((d) => d.name.toLowerCase().includes(term))
    outer: for (const d of db.decks) {
      for (const c of d.cards) {
        if (sCards.length >= 30) break outer
        if (c.q.toLowerCase().includes(term) || c.a.toLowerCase().includes(term)) {
          sCards.push({ q: c.q, a: c.a, deckName: d.name, deckId: d.id })
        }
      }
    }
  }

  const ungrouped = db.decks.filter((d) => !d.folderId)
  const noDecks = db.decks.length === 0

  return (
    <div style={{ padding: '22px 18px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div
            className="font-display"
            style={{ fontWeight: 800, fontSize: 27, letterSpacing: -0.5, color: '#26221B' }}
          >
            Recall
          </div>
        </div>
        <button
          onClick={() => store.openModal({ type: 'settings' })}
          aria-label="Settings"
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
          <SettingsIcon />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(38,34,27,.12)', borderRadius: 14, padding: '12px 12px 10px' }}>
          <div
            className="font-display"
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 22, color: '#26221B' }}
          >
            <FlameIcon />
            <span>{streakNow(db.streak)}</span>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A937F', marginTop: 4 }}>
            Day streak
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(38,34,27,.12)', borderRadius: 14, padding: '12px 12px 10px' }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 22, color: '#26221B' }}>
            {db.stats.answered ? Math.round((db.stats.correct / db.stats.answered) * 100) + '%' : '—'}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A937F', marginTop: 4 }}>
            Accuracy
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(38,34,27,.12)', borderRadius: 14, padding: '12px 12px 10px' }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 22, color: '#26221B' }}>
            {fmtTime(db.stats.timeMs)}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A937F', marginTop: 4 }}>
            Study time
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 16 }}>
        <span style={{ position: 'absolute', left: 13, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: '#9A937F' }}>
          <SearchIcon />
        </span>
        <input
          value={search}
          onChange={(e) => store.setSearch(e.target.value)}
          placeholder="Search decks and cards"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 13,
            border: '1.5px solid rgba(38,34,27,.16)',
            background: '#FFFFFF',
            padding: '0 14px 0 40px',
            fontSize: 16,
            color: '#26221B',
            outline: 'none',
          }}
        />
      </div>

      {searching ? (
        <div style={{ marginTop: 18 }}>
          {sDecks.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque',sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: '#857E6F',
                  margin: '4px 0 10px',
                }}
              >
                Decks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sDecks.map((d) => (
                  <SearchDeckRow key={d.id} deck={d} />
                ))}
              </div>
            </>
          )}
          {sCards.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque',sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: '#857E6F',
                  margin: '18px 0 10px',
                }}
              >
                Cards
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sCards.map((hit, i) => (
                  <CardHitRow key={i} q={hit.q} a={hit.a} deckName={hit.deckName} onOpen={() => store.openDeck(hit.deckId)} />
                ))}
              </div>
            </>
          )}
          {sDecks.length === 0 && sCards.length === 0 && (
            <div style={{ textAlign: 'center', color: '#857E6F', fontSize: 14, padding: '26px 0' }}>No matches</div>
          )}
        </div>
      ) : (
        <>
          {db.folders.map((folder) => (
            <FolderSection key={folder.id} folder={folder} decks={db.decks.filter((d) => d.folderId === folder.id)} />
          ))}

          {ungrouped.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 10px' }}>
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
                  Ungrouped
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#B9B29F' }}>
                  {ungrouped.length} {ungrouped.length === 1 ? 'deck' : 'decks'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ungrouped.map((d) => (
                  <DeckListRow key={d.id} deck={d} />
                ))}
              </div>
            </>
          )}

          {noDecks && (
            <div style={{ textAlign: 'center', padding: '56px 20px 20px' }}>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 18, color: '#26221B' }}>
                No decks yet
              </div>
              <div style={{ fontSize: 14, color: '#857E6F', marginTop: 6, lineHeight: 1.5 }}>
                Create a deck, then add cards one by one or paste a whole list.
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={() => store.openModal({ type: 'deck', mode: 'new' }, { name: '', folder: '' })}
        className="tap-97"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 'max(20px, calc(50% - 230px + 20px))',
          zIndex: 30,
          height: 54,
          padding: '0 20px 0 16px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--accent, #C4551C)',
          color: '#FFFFFF',
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 700,
          fontSize: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 10px 24px rgba(38,34,27,.28)',
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        <PlusIcon />
        New deck
      </button>
    </div>
  )
}
