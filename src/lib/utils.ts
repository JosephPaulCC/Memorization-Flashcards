import { LANGS, type Card, type Settings, type Streak } from './types'

export function uid(): string {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function shuffle<T>(arr: T[]): T[] {
  const r = arr.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = r[i]
    r[i] = r[j]
    r[j] = t
  }
  return r
}

export function dayStr(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function fmtTime(ms: number): string {
  const s = Math.floor((ms || 0) / 1000)
  if (s < 60) return s + 's'
  const m = Math.floor(s / 60)
  if (m < 60) return m + 'm'
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'
}

export function isMastered(c: Card): boolean {
  return (c.consecutiveCorrect | 0) >= 2
}

/** Mutates streak in place: bumps the count on a new day, resets on a missed day. */
export function touchStreak(streak: Streak): void {
  const now = new Date()
  const today = dayStr(now)
  const yesterday = dayStr(new Date(now.getTime() - 864e5))
  if (streak.last === today) return
  streak.count = streak.last === yesterday ? (streak.count | 0) + 1 : 1
  streak.last = today
}

/** Streak reads as 0 once a day has been missed, without mutating (used for display). */
export function streakNow(streak: Streak): number {
  const now = new Date()
  const today = dayStr(now)
  const yesterday = dayStr(new Date(now.getTime() - 864e5))
  return streak.last === today || streak.last === yesterday ? streak.count | 0 : 0
}

export function langLabel(code: string): string {
  const l = LANGS.find((x) => x[0] === code)
  return l ? l[1] : code
}

/** Languages are bound to card fields, not screen position: prompt speaks in the field currently shown as the prompt. */
export function promptLang(settings: Settings, rev: boolean): string {
  return rev ? settings.aLang : settings.qLang
}

export function optLang(settings: Settings, rev: boolean): string {
  return rev ? settings.qLang : settings.aLang
}
