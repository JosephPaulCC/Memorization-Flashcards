import type { Card, DB, Deck, FormFields, ModalState, Session, Turn, UIState } from '../lib/types'
import { loadOrSeedDB, saveDB } from '../lib/storage'
import { isMastered, langLabel, optLang, promptLang, shuffle, touchStreak, uid } from '../lib/utils'
import { SpeechEngine } from '../lib/speech'

type Listener = () => void

interface AdvanceState {
  tid: string
  timer: boolean
  tts: boolean
}

/**
 * Owns all app state (data + UI) outside React, mirroring the original design's class-component
 * engine 1:1 in behavior. Components read state via useSyncExternalStore and call these methods
 * as event handlers.
 */
export class FlashcardsStore {
  private snapshot: UIState
  private listeners = new Set<Listener>()
  private speech = new SpeechEngine()
  private advTimer: ReturnType<typeof setTimeout> | null = null
  private adv: AdvanceState | null = null
  private toastTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    const db = loadOrSeedDB()
    this.snapshot = {
      db,
      screen: 'home',
      deckId: null,
      search: '',
      modal: null,
      f: {},
      sess: null,
      viewIdx: 0,
      revealed: true,
      toast: null,
      onboard: !db.onboarded,
    }
    this.speech.warmVoices(() => this.notify())
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): UIState => this.snapshot

  private notify() {
    this.snapshot = { ...this.snapshot }
    this.listeners.forEach((l) => l())
  }

  private setUI(partial: Partial<UIState>) {
    this.snapshot = { ...this.snapshot, ...partial }
    this.listeners.forEach((l) => l())
  }

  private save() {
    saveDB(this.snapshot.db)
  }

  /** Mutates db in place (matches the source design's style), then persists + notifies. */
  private mut(fn: (db: DB) => void) {
    fn(this.snapshot.db)
    this.save()
    this.notify()
  }

  // ---------- generic UI primitives ----------

  setSearch(value: string) {
    this.setUI({ search: value })
  }

  openModal(modal: Exclude<ModalState, null>, fields?: FormFields) {
    this.setUI({ modal, ...(fields ? { f: fields } : {}) })
  }

  openConfirm(action: 'deck' | 'folder' | 'card', id: string, title: string, msg: string) {
    this.setUI({ modal: { type: 'confirm', action, id, title, msg } })
  }

  closeModal() {
    this.setUI({ modal: null })
  }

  setField(key: keyof FormFields, value: string) {
    this.setUI({ f: { ...this.snapshot.f, [key]: value } })
  }

  openDeck(id: string) {
    this.setUI({ screen: 'deck', deckId: id, search: '' })
  }

  goHome() {
    this.speech.stop()
    this.setUI({ screen: 'home', sess: null, viewIdx: 0 })
  }

  dismissOnboarding() {
    this.mut((db) => {
      db.onboarded = true
    })
    this.setUI({ onboard: false })
  }

  // ---------- misc helpers ----------

  showToast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer)
    this.setUI({ toast: msg })
    this.toastTimer = setTimeout(() => this.setUI({ toast: null }), 3400)
  }

  curDeck(): Deck | null {
    return this.snapshot.db.decks.find((d) => d.id === this.snapshot.deckId) || null
  }

  // ---------- speech ----------

  stopSpeech() {
    this.speech.stop()
  }

  speak(text: string, lang: string, onend: (() => void) | null = null) {
    this.speech.speak(text, lang, onend, (l) => this.langNotice(l))
  }

  private langNotice(lang: string) {
    if (this.snapshot.db.ttsNoticed[lang]) return
    this.mut((db) => {
      db.ttsNoticed[lang] = true
    })
    this.showToast('No ' + langLabel(lang) + ' voice available on this device')
  }

  // ---------- session engine ----------

  startSession() {
    const db = this.snapshot.db
    const deck = this.curDeck()
    if (!deck) return
    if (deck.cards.length < 4) {
      this.showToast('Add at least 4 cards to practice')
      return
    }
    let pool = deck.cards
    if (deck.remainingOnly) pool = pool.filter((c) => !isMastered(c))
    if (!pool.length) {
      this.showToast('All cards mastered — turn off "Practice remaining only" to review')
      return
    }
    const wrong: Card[] = []
    const fresh: Card[] = []
    const rest: Card[] = []
    pool.forEach((c) => {
      if (c.lastResult === 'wrong') wrong.push(c)
      else if (c.lastResult == null) fresh.push(c)
      else rest.push(c)
    })
    const queue = shuffle(wrong).concat(shuffle(fresh)).concat(shuffle(rest)).map((c) => c.id)
    const s: Session = { deckId: deck.id, queue, turns: [], answered: {}, lastMark: Date.now() }
    this.genTurn(s)
    if (!s.turns.length) return
    this.speech.stop()
    this.clearAdvance()
    this.setUI({ screen: 'session', sess: s, viewIdx: 0, revealed: !db.settings.hidden })
    const t = s.turns[0]
    if (t && db.settings.autoRead) this.speak(t.prompt, promptLang(db.settings, t.rev), null)
  }

  private genTurn(s: Session): boolean {
    const db = this.snapshot.db
    const deck = db.decks.find((d) => d.id === s.deckId)
    if (!deck) return false

    let card: Card | null = null
    while (s.queue.length) {
      const id = s.queue.shift()
      if (id === undefined) break
      if (s.answered[id]) continue
      const c = deck.cards.find((x) => x.id === id)
      if (!c) continue
      card = c
      break
    }
    if (!card) return false
    const cur = card

    const rev = !!deck.reverse
    const correct = rev ? cur.q : cur.a
    const seen = new Set<string>()
    const pool: string[] = []
    deck.cards.forEach((c2) => {
      if (c2.id === cur.id) return
      const t2 = rev ? c2.q : c2.a
      if (t2 === correct || seen.has(t2)) return
      seen.add(t2)
      pool.push(t2)
    })
    const distractors = shuffle(pool).slice(0, 3)
    const options = shuffle([correct, ...distractors])
    const turn: Turn = {
      id: uid(),
      cardId: cur.id,
      rev,
      prompt: rev ? cur.a : cur.q,
      options,
      correctIdx: options.indexOf(correct),
      sel: null,
      result: null,
      skipped: false,
    }
    s.turns.push(turn)
    return true
  }

  private presentLive() {
    const s = this.snapshot.sess
    if (!s || !s.turns.length) return
    const li = s.turns.length - 1
    const t = s.turns[li]
    this.speech.stop()
    const db = this.snapshot.db
    this.setUI({ viewIdx: li, revealed: !db.settings.hidden })
    if (db.settings.autoRead && t) this.speak(t.prompt, promptLang(db.settings, t.rev), null)
  }

  nextTurn() {
    const s = this.snapshot.sess
    if (!s) return
    this.clearAdvance()
    if (this.genTurn(s)) this.presentLive()
    else this.finishSession()
  }

  private markTime(s: Session, db: DB) {
    const now = Date.now()
    const dt = now - (s.lastMark || now)
    if (dt > 0) db.stats.timeMs = (db.stats.timeMs || 0) + dt
    s.lastMark = now
  }

  hiddenNowCalc(): boolean {
    const S = this.snapshot
    const s = S.sess
    if (!s || !s.turns.length) return false
    const li = s.turns.length - 1
    const t = s.turns[S.viewIdx]
    return S.viewIdx === li && !!t && t.sel == null && !S.revealed
  }

  revealOptions() {
    if (this.hiddenNowCalc()) this.setUI({ revealed: true })
  }

  pick(turnIdx: number, optIdx: number) {
    const S = this.snapshot
    const s = S.sess
    if (!s) return
    const t = s.turns[turnIdx]
    if (!t || t.sel != null) return
    const li = s.turns.length - 1
    const isLive = turnIdx === li
    if (isLive && this.hiddenNowCalc()) return
    if (!isLive && !(t.skipped && !s.answered[t.cardId])) return

    t.sel = optIdx
    t.result = optIdx === t.correctIdx ? 'correct' : 'wrong'
    s.answered[t.cardId] = true
    s.queue = s.queue.filter((x) => x !== t.cardId)

    const db = S.db
    const deck = db.decks.find((d) => d.id === s.deckId)
    const card = deck ? deck.cards.find((c) => c.id === t.cardId) : null
    if (card) {
      if (t.result === 'correct') {
        card.timesCorrect = (card.timesCorrect | 0) + 1
        card.consecutiveCorrect = (card.consecutiveCorrect | 0) + 1
      } else {
        card.timesWrong = (card.timesWrong | 0) + 1
        card.consecutiveCorrect = 0
      }
      card.lastResult = t.result
    }
    db.stats.answered++
    if (t.result === 'correct') db.stats.correct++
    touchStreak(db.streak)
    this.markTime(s, db)
    this.save()
    this.speech.stop()

    const autoRead = db.settings.autoRead
    if (t.result === 'correct') {
      if (isLive) this.armAdvance(t.id, autoRead)
      if (autoRead) {
        this.speak(t.options[t.correctIdx], optLang(db.settings, t.rev), () => this.advanceFlag(t.id, 'tts'))
      }
    }
    this.notify()
  }

  private armAdvance(tid: string, waitTts: boolean) {
    this.clearAdvance()
    const a: AdvanceState = { tid, timer: false, tts: !waitTts }
    this.adv = a
    this.advTimer = setTimeout(() => {
      if (this.adv === a) {
        a.timer = true
        this.tryAdvance()
      }
    }, 800)
  }

  private advanceFlag(tid: string, key: 'timer' | 'tts') {
    if (this.adv && this.adv.tid === tid) {
      this.adv[key] = true
      this.tryAdvance()
    }
  }

  private tryAdvance() {
    const a = this.adv
    const s = this.snapshot.sess
    if (!a || !s || this.snapshot.screen !== 'session') return
    if (!a.timer || !a.tts) return
    const li = s.turns.length - 1
    const t = s.turns[li]
    if (!t || t.id !== a.tid) return
    if (this.snapshot.viewIdx !== li) return
    this.adv = null
    if (this.advTimer) {
      clearTimeout(this.advTimer)
      this.advTimer = null
    }
    this.nextTurn()
  }

  private clearAdvance() {
    if (this.advTimer) {
      clearTimeout(this.advTimer)
      this.advTimer = null
    }
    this.adv = null
  }

  private resumeAdvance() {
    const a = this.adv
    if (!a) return
    if (this.advTimer) clearTimeout(this.advTimer)
    a.timer = false
    this.advTimer = setTimeout(() => {
      if (this.adv === a) {
        a.timer = true
        this.tryAdvance()
      }
    }, 800)
  }

  goView(idx: number) {
    const s = this.snapshot.sess
    if (!s) return
    const li = s.turns.length - 1
    const v = Math.max(0, Math.min(li, idx))
    if (v === this.snapshot.viewIdx) return
    this.speech.stop()
    this.setUI({ viewIdx: v })
    if (v === li) this.resumeAdvance()
  }

  skipTurn() {
    const S = this.snapshot
    const s = S.sess
    if (!s) return
    const li = s.turns.length - 1
    if (S.viewIdx !== li) return
    const t = s.turns[li]
    if (!t || t.sel != null) return
    // A skip is not re-queued: the session total stays fixed and the card can
    // only be answered later via backward navigation.
    t.skipped = true
    this.markTime(s, S.db)
    this.save()
    this.clearAdvance()
    if (this.genTurn(s)) this.presentLive()
    else this.finishSession()
  }

  finishSession() {
    const S = this.snapshot
    const s = S.sess
    if (!s) return
    this.markTime(s, S.db)
    this.save()
    this.speech.stop()
    this.clearAdvance()
    this.setUI({ screen: 'results' })
  }

  backToDeckFromResults() {
    this.setUI({ screen: 'deck', sess: null, viewIdx: 0 })
  }

  // ---------- CRUD ----------

  saveDeckModal() {
    const f = this.snapshot.f
    const name = (f.name || '').trim()
    if (!name) {
      this.showToast('Give the deck a name')
      return
    }
    const folderName = (f.folder || '').trim()
    const m = this.snapshot.modal
    if (!m || m.type !== 'deck') return
    let openId: string | null = null
    this.mut((db) => {
      let folderId: string | null = null
      if (folderName) {
        let fo = db.folders.find((x) => x.name.toLowerCase() === folderName.toLowerCase())
        if (!fo) {
          fo = { id: uid(), name: folderName }
          db.folders.push(fo)
        }
        folderId = fo.id
      }
      if (m.mode === 'new') {
        const d: Deck = { id: uid(), name, folderId, reverse: false, remainingOnly: false, cards: [] }
        db.decks.push(d)
        openId = d.id
      } else {
        const d = db.decks.find((x) => x.id === m.deckId)
        if (d) {
          d.name = name
          d.folderId = folderId
        }
      }
    })
    if (openId) this.setUI({ screen: 'deck', deckId: openId, modal: null, search: '', f: {} })
    else this.setUI({ modal: null, f: {} })
  }

  saveCardModal() {
    const f = this.snapshot.f
    const q = (f.q || '').trim()
    const a = (f.a || '').trim()
    if (!q || !a) {
      this.showToast('Both question and answer are required')
      return
    }
    const m = this.snapshot.modal
    if (!m || m.type !== 'card') return
    this.mut((db) => {
      const d = db.decks.find((x) => x.id === this.snapshot.deckId)
      if (!d) return
      if (m.mode === 'new') {
        d.cards.push({ id: uid(), q, a, timesCorrect: 0, timesWrong: 0, consecutiveCorrect: 0, lastResult: null })
      } else {
        const c = d.cards.find((x) => x.id === m.cardId)
        if (c) {
          c.q = q
          c.a = a
        }
      }
    })
    this.setUI({ modal: null, f: {} })
  }

  runBulk() {
    const text = this.snapshot.f.bulk || ''
    const lines = text.split(/\r?\n/)
    let added = 0
    let skipped = 0
    const rows: { q: string; a: string }[] = []
    lines.forEach((line) => {
      if (!line.trim()) {
        skipped++
        return
      }
      const i = line.indexOf('=')
      if (i < 0) {
        skipped++
        return
      }
      const q = line.slice(0, i).trim()
      const a = line.slice(i + 1).trim()
      if (!q || !a) {
        skipped++
        return
      }
      rows.push({ q, a })
      added++
    })
    if (added) {
      this.mut((db) => {
        const d = db.decks.find((x) => x.id === this.snapshot.deckId)
        if (d) {
          rows.forEach((r) => {
            d.cards.push({ id: uid(), q: r.q, a: r.a, timesCorrect: 0, timesWrong: 0, consecutiveCorrect: 0, lastResult: null })
          })
        }
      })
      this.setUI({ modal: null, f: {} })
    }
    this.showToast(added + ' cards added, ' + skipped + ' lines skipped')
  }

  private delDeck(id: string) {
    this.mut((db) => {
      db.decks = db.decks.filter((d) => d.id !== id)
    })
    this.setUI({ screen: 'home', deckId: null })
  }

  private delFolder(id: string) {
    this.mut((db) => {
      db.decks.forEach((d) => {
        if (d.folderId === id) d.folderId = null
      })
      db.folders = db.folders.filter((f) => f.id !== id)
    })
  }

  private delCard(id: string) {
    this.mut((db) => {
      const d = db.decks.find((x) => x.id === this.snapshot.deckId)
      if (d) d.cards = d.cards.filter((c) => c.id !== id)
    })
    const s = this.snapshot.sess
    if (s && this.snapshot.screen === 'session') {
      s.queue = s.queue.filter((x) => x !== id)
      const li = s.turns.length - 1
      const lt = s.turns[li]
      if (lt && lt.cardId === id && lt.sel == null) {
        s.turns.pop()
        this.clearAdvance()
        if (this.genTurn(s)) this.presentLive()
        else this.finishSession()
      } else {
        this.notify()
      }
    }
  }

  confirmYesRun() {
    const m = this.snapshot.modal
    if (!m || m.type !== 'confirm') return
    this.setUI({ modal: null })
    if (m.action === 'deck') this.delDeck(m.id)
    else if (m.action === 'folder') this.delFolder(m.id)
    else if (m.action === 'card') this.delCard(m.id)
  }

  toggleDeckFlag(key: 'reverse' | 'remainingOnly') {
    this.mut((db) => {
      const d = db.decks.find((x) => x.id === this.snapshot.deckId)
      if (d) d[key] = !d[key]
    })
  }

  toggleSetting(key: 'hidden' | 'autoRead') {
    this.mut((db) => {
      db.settings[key] = !db.settings[key]
    })
    if (key === 'hidden' && !this.snapshot.db.settings.hidden) {
      this.setUI({ revealed: true })
    }
  }

  setSettingLang(field: 'qLang' | 'aLang', code: string) {
    this.mut((db) => {
      db.settings[field] = code
    })
  }
}

export const store = new FlashcardsStore()
