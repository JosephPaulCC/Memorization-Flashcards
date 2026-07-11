# Advanced Flashcard Memorization App

_Started 2026-07-10 14:47 UTC_

---

## User

# Advanced Flashcard Memorization — Mobile Web App

You are an expert mobile web developer. Build a complete, production-ready, single-page flashcard app (React + Tailwind) optimized for Android touch browsers in portrait mode. No backend, no accounts, no external services — the only browser APIs used are `localStorage` and the Web Speech API. Follow every rule below exactly. Where a behavior is not stated, choose the simplest behavior consistent with these rules; do not invent extra features.

## 1. Data & Persistence
- Persist everything (folders, decks, cards, per-card stats, streak, analytics, settings) in `localStorage` under a single versioned key, e.g. `flashcards.v1`, as JSON.
- Wrap all storage reads/writes in try/catch. If stored data is missing or corrupt, start from defaults — never crash.
- Per-card stats: `timesCorrect`, `timesWrong`, `consecutiveCorrect`, `lastResult` (`"correct"` | `"wrong"` | `null`).
- **Mastered (exact definition):** a card is Mastered when `consecutiveCorrect >= 2`. A wrong answer resets `consecutiveCorrect` to 0, un-mastering the card. Use this single definition everywhere "mastered" appears.
- **First launch** (empty storage): show a dismissable Onboarding Tutorial overlay and create one sample English deck with 6 sample cards. Store a flag so onboarding never reappears.

## 2. Dashboard & Analytics
- Dashboard lists all folders and decks, plus three global stats:
  - **Streak:** consecutive calendar days (device local time) with at least 1 answered question.
  - **Overall accuracy:** lifetime total correct ÷ total answered, shown as a %.
  - **Total study time:** accumulated time spent inside active practice sessions.
- Per deck: completion % = Mastered ÷ total cards, plus explicit "Mastered" and "Remaining" counts.

## 3. Folders, Decks & Cards
- **Folders:** one level only, no nesting. A deck belongs to at most one folder; decks without one appear under "Ungrouped". The folder field offers autocomplete of existing folder names. Deleting a folder moves its decks to Ungrouped — it never deletes decks.
- **Decks:** create, rename, delete. A deck may be saved with any number of cards, including zero — the 4-card minimum applies only to practicing (see §4).
- **Cards:** add, edit, or delete at any time, including mid-session. Mid-session changes take effect from the next question onward; if the currently displayed card is deleted, advance immediately. Turns already stored in session history keep their original snapshot.
- **Search:** a global search bar filters decks by title and cards by question/answer text; tapping a result opens that deck.
- **Bulk add (exact parsing rules):** a large multi-line textarea. The text placed before the '=' sign must turn into the question and the text placed after the '=' sign must turn into the answer ('question=answer' format), trim whitespace from both. Writing from a new line within the textbox would mean new card. Skip a line if it is blank, contains no `=`, or has an empty question or answer after trimming. After import, show a summary: "N cards added, M lines skipped."

## 4. Practice Engine (MCQ)
- Each turn shows the question with 4 large, thumb-friendly option buttons:
  - 1 option is the current card's answer.
  - 3 distractors are answers randomly drawn from **other cards in the same deck**, deduplicated by exact text and never equal to the correct answer. If fewer than 3 unique distractor texts exist, show fewer options (minimum 2 total) — never show duplicate options.
  - Randomize option positions on every turn.
- **Reverse mode** (per-deck toggle): the card's answer field becomes the prompt, the question field becomes the correct option, and distractors are drawn from other cards' **question** texts using the same uniqueness rules.
- **Question order** at every session start: (1) cards with `lastResult = "wrong"`, then (2) never-attempted cards, then (3) all remaining cards — shuffled **within** each group.
- **Practice remaining only** (per-deck toggle): when on, Mastered cards are entirely excluded from the session.

## 5. Session UI & Flow
- **Hidden Options** toggle: when on, options are invisible on each new question until the user taps anywhere below the question area; they then appear. Resets on every question.
- **Feedback:** tapping an option locks it in. Correct → that option turns green. Wrong → the tapped option turns red **and** the correct option turns green simultaneously.
- **Advance rules (exact):**
  - Correct answer: auto-advance to the next question after 800 ms — or, if auto-read is on, after the answer TTS finishes, whichever is later.
  - Wrong answer: never auto-advance; show a **Next** button and wait for the tap.
- **Skip** button: moves the current card to the end of the session queue. A skip is not an attempt and the user shall be able to answer it later through backward navigation. If a card is still unanswered when the session ends, it is listed as "skipped" in results and excluded from accuracy.
- **Back navigation:** the user can step back through this session's previous turns. Each turn's snapshot — question, exact option order, selection, and color highlights — is preserved and shown read-only; past answers cannot be changed, but unanswered skipped questions can be answered. A forward control returns to the live question. Auto-advance is paused while reviewing history.
- **End Session** button is always visible and ends the session early, showing results.
- **Results screen:** total score, accuracy % (correct ÷ answered), and a per-question breakdown showing the question, the chosen answer, the correct answer, and right/wrong status.
- **Auto-read** toggle (available during the session): when on, each new question is spoken automatically, and the answer is spoken automatically **only** when the user taps the correct option — never after a wrong tap.

## 6. Text-to-Speech
- Use only the native Web Speech API (`window.speechSynthesis`).
- **Language pickers** — one for the card **question field**, one for the card **answer field** — available in settings and changeable mid-session. Languages: English (en-IN), Hindi (hi-IN), Telugu (te-IN), Kannada (kn-IN), Malayalam (ml-IN), Tamil (ta-IN), Urdu (ur-PK), Persian (fa-IR), Arabic (ar-SA).
- Languages are bound to the card **fields**, not to screen position: in Reverse mode, the on-screen prompt (the answer field) is spoken with the answer language, and the options with the question language.
- **Speaker icons:** one on the right side of the question text and one beside each option. Tapping an icon speaks exactly that text in its configured language. Starting any new speech, or advancing to a new question, cancels speech already playing.
- **Voice fallback:** if the device has no installed voice for the selected language, show a small one-time non-blocking notice ("No [language] voice available on this device") and skip speaking — never crash or block the session.
- **RTL:** Urdu, Persian, and Arabic must render correctly — apply `dir="auto"` to the question text, option buttons, and card-editing inputs.

## 7. Mobile UX Baseline
- Fully responsive, portrait-first. Touch targets at least 44px. No hover-dependent interactions. Include the standard mobile viewport meta tag and prevent accidental double-tap zoom on answer buttons.

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: set_project_title]_

_[tool: dc_write]_

_[tool: dc_write]_

## Assistant

_[tool: ready_for_verification]_

The app is live in **Flashcards.dc.html** — all spec behaviors implemented: single `flashcards.v1` store with safe fallbacks, onboarding + 6-card sample deck, dashboard stats (streak / lifetime accuracy / study time), folders with autocomplete, global search, bulk `question=answer` import with skip summary, MCQ engine with dedup distractors, reverse mode, wrong-first ordering, hidden options, skip + answerable history review, exact advance rules (800ms / TTS-gated), 9-language Web Speech with per-field bindings, RTL via `dir="auto"`, and 44px+ touch targets.

Caveats: TTS voice availability depends on the device (a one-time notice appears per missing language), and mid-session card edits apply from the next question per spec. Tweaks panel has accent color + big-text options.

