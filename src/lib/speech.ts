/** Thin wrapper around window.speechSynthesis: voice matching, fallback notice hook, and a GC-safety timeout. */
export class SpeechEngine {
  private speakCap: ReturnType<typeof setTimeout> | null = null
  // Kept referenced so it isn't GC'd mid-utterance, which silently drops the onend callback in some browsers.
  private utter: SpeechSynthesisUtterance | null = null

  warmVoices(onChange: () => void) {
    try {
      const synth = window.speechSynthesis
      if (synth) {
        synth.getVoices()
        synth.onvoiceschanged = onChange
      }
    } catch {
      // Web Speech API unavailable on this device
    }
  }

  stop() {
    if (this.utter) {
      // detach so a cancel() that doesn't fire onerror synchronously can't trigger a stale callback later
      this.utter.onend = null
      this.utter.onerror = null
      this.utter = null
    }
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Web Speech API unavailable on this device
    }
  }

  speak(text: string, lang: string, onend: (() => void) | null, onVoiceMissing?: (lang: string) => void) {
    let done = false
    const fin = () => {
      if (done) return
      done = true
      onend?.()
    }

    let synth: SpeechSynthesis | null = null
    try {
      synth = window.speechSynthesis
    } catch {
      // Web Speech API unavailable on this device
    }
    if (!synth || !text) {
      fin()
      return
    }

    if (this.speakCap) {
      clearTimeout(this.speakCap)
      this.speakCap = null
    }
    try {
      synth.cancel()
    } catch {
      // ignore
    }

    let voices: SpeechSynthesisVoice[] = []
    try {
      voices = synth.getVoices() || []
    } catch {
      // ignore
    }
    const base = String(lang || '').slice(0, 2).toLowerCase()
    const norm = (v: SpeechSynthesisVoice) => String(v.lang || '').replace('_', '-').toLowerCase()
    const voice =
      voices.find((v) => norm(v) === String(lang).toLowerCase()) ||
      voices.find((v) => norm(v).indexOf(base) === 0) ||
      null

    if (voices.length && !voice) {
      onVoiceMissing?.(lang)
      fin()
      return
    }

    try {
      const u = new SpeechSynthesisUtterance(String(text))
      u.lang = lang
      if (voice) u.voice = voice
      u.onend = fin
      u.onerror = fin
      this.utter = u
      try {
        synth.resume()
      } catch {
        // ignore
      }
      synth.speak(u)
      this.speakCap = setTimeout(fin, Math.min(20000, 3000 + String(text).length * 120))
    } catch {
      fin()
    }
  }
}
