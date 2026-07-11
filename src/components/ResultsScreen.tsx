import type { Session } from '../lib/types'
import { store } from '../store/flashcardsStore'

interface ResultRow {
  key: string
  q: string
  dot: string
  ansLine: string
  ansColor: string
  showCorrect: boolean
  correctLine: string
  tag: string
  tagColor: string
}

function buildRows(sess: Session) {
  const rows: ResultRow[] = []
  const seenSkip = new Set<string>()
  let correctN = 0
  let answeredN = 0
  let skippedN = 0
  sess.turns.forEach((t) => {
    if (t.sel != null) {
      answeredN++
      const ok = t.result === 'correct'
      if (ok) correctN++
      rows.push({
        key: t.id,
        q: t.prompt,
        dot: ok ? '#1E8A5A' : '#C6392C',
        ansLine: 'Your answer: ' + t.options[t.sel],
        ansColor: ok ? '#6E6857' : '#C6392C',
        showCorrect: !ok,
        correctLine: 'Correct: ' + t.options[t.correctIdx],
        tag: ok ? 'Right' : 'Wrong',
        tagColor: ok ? '#1E8A5A' : '#C6392C',
      })
    } else if (!sess.answered[t.cardId] && !seenSkip.has(t.cardId)) {
      seenSkip.add(t.cardId)
      skippedN++
      rows.push({
        key: t.id,
        q: t.prompt,
        dot: '#B9B29F',
        ansLine: 'Not answered',
        ansColor: '#9A937F',
        showCorrect: false,
        correctLine: '',
        tag: 'Skipped',
        tagColor: '#9A937F',
      })
    }
  })
  return { rows, correctN, answeredN, skippedN }
}

export function ResultsScreen({ sess }: { sess: Session }) {
  const { rows, correctN, answeredN, skippedN } = buildRows(sess)
  const resAcc = answeredN ? Math.round((correctN / answeredN) * 100) + '%' : '—'

  return (
    <div style={{ padding: '22px 18px 40px' }}>
      <div className="font-display" style={{ fontWeight: 800, fontSize: 24, color: '#26221B' }}>
        Session results
      </div>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(38,34,27,.12)',
          borderRadius: 18,
          padding: 20,
          marginTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 42, lineHeight: 1, color: '#26221B' }}>
            {correctN}/{answeredN}
          </div>
          <div style={{ fontSize: 12.5, color: '#857E6F', marginTop: 7 }}>
            correct of answered{skippedN ? ` · ${skippedN} skipped` : ''}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 27, color: 'var(--accent, #C4551C)' }}>
            {resAcc}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A937F', marginTop: 2 }}>
            Accuracy
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(38,34,27,.1)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ flex: 'none', width: 10, height: 10, borderRadius: '50%', marginTop: 5, background: r.dot }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div dir="auto" style={{ fontSize: 14.5, fontWeight: 600, color: '#26221B', lineHeight: 1.35, wordBreak: 'break-word' }}>
                {r.q}
              </div>
              <div dir="auto" style={{ fontSize: 13, color: r.ansColor, marginTop: 3, wordBreak: 'break-word' }}>
                {r.ansLine}
              </div>
              {r.showCorrect && (
                <div dir="auto" style={{ fontSize: 13, color: '#1E8A5A', marginTop: 2, wordBreak: 'break-word' }}>
                  {r.correctLine}
                </div>
              )}
            </div>
            <span
              style={{
                flex: 'none',
                fontFamily: "'Bricolage Grotesque',sans-serif",
                fontWeight: 700,
                fontSize: 10.5,
                letterSpacing: 0.8,
                color: r.tagColor,
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              {r.tag}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => store.backToDeckFromResults()}
        style={{
          width: '100%',
          height: 54,
          marginTop: 20,
          borderRadius: 14,
          border: 'none',
          background: 'var(--accent, #C4551C)',
          color: '#FFFFFF',
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        Back to deck
      </button>
      <button
        onClick={() => store.goHome()}
        style={{
          width: '100%',
          height: 50,
          marginTop: 10,
          borderRadius: 14,
          border: '1.5px solid rgba(38,34,27,.18)',
          background: '#FFFFFF',
          color: '#26221B',
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        Home
      </button>
    </div>
  )
}
