import { LANGS, type Card, type DB, type Deck, type Folder } from './types'
import { uid } from './utils'

const STORAGE_KEY = 'flashcards.v1'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toCard(raw: unknown): Card | null {
  if (!isRecord(raw) || !raw.id) return null
  const lastResult = raw.lastResult === 'correct' || raw.lastResult === 'wrong' ? raw.lastResult : null
  return {
    id: String(raw.id),
    q: String(raw.q ?? ''),
    a: String(raw.a ?? ''),
    timesCorrect: Number(raw.timesCorrect) | 0,
    timesWrong: Number(raw.timesWrong) | 0,
    consecutiveCorrect: Number(raw.consecutiveCorrect) | 0,
    lastResult,
  }
}

function toDeck(raw: unknown): Deck | null {
  if (!isRecord(raw) || !raw.id) return null
  return {
    id: String(raw.id),
    name: String(raw.name || 'Untitled'),
    folderId: raw.folderId ? String(raw.folderId) : null,
    reverse: !!raw.reverse,
    remainingOnly: !!raw.remainingOnly,
    cards: Array.isArray(raw.cards)
      ? raw.cards.map(toCard).filter((c): c is Card => c !== null)
      : [],
  }
}

function toFolder(raw: unknown): Folder | null {
  if (!isRecord(raw) || !raw.id || typeof raw.name !== 'string') return null
  return { id: String(raw.id), name: raw.name }
}

/** Reads flashcards.v1 from localStorage; returns null on missing/corrupt data so callers fall back to defaults. */
export function loadDB(): DB | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const d: unknown = JSON.parse(raw)
    if (!isRecord(d) || d.v !== 1) return null
    const knownCodes = new Set(LANGS.map((l) => l[0]))

    const out: DB = {
      v: 1,
      onboarded: !!d.onboarded,
      folders: Array.isArray(d.folders)
        ? d.folders.map(toFolder).filter((f): f is Folder => f !== null)
        : [],
      decks: Array.isArray(d.decks)
        ? d.decks.map(toDeck).filter((k): k is Deck => k !== null)
        : [],
      streak: isRecord(d.streak)
        ? { last: (d.streak.last as string | null) || null, count: Number(d.streak.count) | 0 }
        : { last: null, count: 0 },
      stats: isRecord(d.stats)
        ? {
            correct: Number(d.stats.correct) | 0,
            answered: Number(d.stats.answered) | 0,
            timeMs: typeof d.stats.timeMs === 'number' && d.stats.timeMs > 0 ? d.stats.timeMs : 0,
          }
        : { correct: 0, answered: 0, timeMs: 0 },
      settings: { qLang: 'en-IN', aLang: 'en-IN', hidden: false, autoRead: false },
      ttsNoticed: isRecord(d.ttsNoticed) ? (d.ttsNoticed as Record<string, boolean>) : {},
    }
    if (isRecord(d.settings)) {
      const s = d.settings
      if (typeof s.qLang === 'string' && knownCodes.has(s.qLang)) out.settings.qLang = s.qLang
      if (typeof s.aLang === 'string' && knownCodes.has(s.aLang)) out.settings.aLang = s.aLang
      out.settings.hidden = !!s.hidden
      out.settings.autoRead = !!s.autoRead
    }
    return out
  } catch {
    return null
  }
}

function makeCard(q: string, a: string): Card {
  return { id: uid(), q, a, timesCorrect: 0, timesWrong: 0, consecutiveCorrect: 0, lastResult: null }
}

export function seedDB(): DB {
  const db: DB = {
    v: 1,
    onboarded: false,
    folders: [],
    decks: [
      {
        id: uid(),
        name: 'English Vocabulary',
        folderId: null,
        reverse: false,
        remainingOnly: false,
        cards: [
          makeCard('Ephemeral', 'Lasting a very short time'),
          makeCard('Ubiquitous', 'Present everywhere at once'),
          makeCard('Meticulous', 'Extremely careful and precise'),
          makeCard('Resilient', 'Quick to recover from setbacks'),
          makeCard('Candid', 'Honest and direct'),
          makeCard('Eloquent', 'Fluent and persuasive in speaking'),
        ],
      },
    ],
    streak: { last: null, count: 0 },
    stats: { correct: 0, answered: 0, timeMs: 0 },
    settings: { qLang: 'en-IN', aLang: 'en-IN', hidden: false, autoRead: false },
    ttsNoticed: {},
  }
  saveDB(db)
  return db
}

/** Never throws: storage failures (quota, private mode) are swallowed so the session continues in-memory. */
export function saveDB(db: DB): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // ignored — see doc comment above
  }
}

export function loadOrSeedDB(): DB {
  return loadDB() ?? seedDB()
}
