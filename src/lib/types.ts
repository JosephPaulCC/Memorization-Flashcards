export interface Card {
  id: string
  q: string
  a: string
  timesCorrect: number
  timesWrong: number
  consecutiveCorrect: number
  lastResult: 'correct' | 'wrong' | null
}

export interface Deck {
  id: string
  name: string
  folderId: string | null
  reverse: boolean
  remainingOnly: boolean
  cards: Card[]
}

export interface Folder {
  id: string
  name: string
}

export interface Settings {
  qLang: string
  aLang: string
  hidden: boolean
  autoRead: boolean
}

export interface Streak {
  last: string | null
  count: number
}

export interface Stats {
  correct: number
  answered: number
  timeMs: number
}

export interface DB {
  v: 1
  onboarded: boolean
  folders: Folder[]
  decks: Deck[]
  streak: Streak
  stats: Stats
  settings: Settings
  ttsNoticed: Record<string, boolean>
}

export interface Turn {
  id: string
  cardId: string
  rev: boolean
  prompt: string
  options: string[]
  correctIdx: number
  sel: number | null
  result: 'correct' | 'wrong' | null
  skipped: boolean
}

export interface Session {
  deckId: string
  queue: string[]
  turns: Turn[]
  answered: Record<string, boolean>
  lastMark: number
}

export type ModalState =
  | { type: 'deck'; mode: 'new' }
  | { type: 'deck'; mode: 'edit'; deckId: string }
  | { type: 'card'; mode: 'new' }
  | { type: 'card'; mode: 'edit'; cardId: string }
  | { type: 'bulk' }
  | { type: 'settings' }
  | { type: 'confirm'; action: 'deck' | 'folder' | 'card'; id: string; title: string; msg: string }
  | null

export type Screen = 'home' | 'deck' | 'session' | 'results'

export interface FormFields {
  name?: string
  folder?: string
  q?: string
  a?: string
  bulk?: string
}

export interface UIState {
  db: DB
  screen: Screen
  deckId: string | null
  search: string
  modal: ModalState
  f: FormFields
  sess: Session | null
  viewIdx: number
  revealed: boolean
  toast: string | null
  onboard: boolean
}

export const LANGS: [string, string][] = [
  ['en-US', 'English (US)'],
  ['en-GB', 'English (UK)'],
  ['hi-IN', 'Hindi'],
  ['te-IN', 'Telugu'],
  ['kn-IN', 'Kannada'],
  ['ml-IN', 'Malayalam'],
  ['ta-IN', 'Tamil'],
  ['ur-PK', 'Urdu'],
  ['fa-IR', 'Persian'],
  ['ar-SA', 'Arabic'],
]

