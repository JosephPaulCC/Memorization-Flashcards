import { store } from '../../store/flashcardsStore'

export function ConfirmModal({ title, message }: { title: string; message: string }) {
  return (
    <div
      onClick={() => store.closeModal()}
      className="anim-fade"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 55,
        background: 'rgba(28,25,20,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-sheet-up"
        style={{ width: '100%', maxWidth: 340, background: '#FBF9F4', borderRadius: 18, padding: 20 }}
      >
        <div className="font-display" style={{ fontWeight: 700, fontSize: 17, color: '#26221B' }}>
          {title}
        </div>
        <div dir="auto" style={{ fontSize: 14, color: '#6E6857', lineHeight: 1.5, marginTop: 8 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            onClick={() => store.closeModal()}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 12,
              border: '1.5px solid rgba(38,34,27,.18)',
              background: '#FFFFFF',
              color: '#26221B',
              fontFamily: "'Bricolage Grotesque',sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => store.confirmYesRun()}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 12,
              border: 'none',
              background: '#C6392C',
              color: '#FFFFFF',
              fontFamily: "'Bricolage Grotesque',sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
