import type { ReactNode } from 'react'
import { CloseIcon } from '../Icons'

export function ModalSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      onClick={onClose}
      className="anim-fade"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(28,25,20,.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-sheet-up"
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#FBF9F4',
          borderRadius: '22px 22px 0 0',
          padding: '20px 20px calc(24px + env(safe-area-inset-bottom))',
          maxHeight: '88dvh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div className="font-display" style={{ flex: 1, fontWeight: 700, fontSize: 18, color: '#26221B' }}>
            {title}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: 'none',
              background: 'rgba(38,34,27,.06)',
              color: '#6E6857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontFamily: "'Bricolage Grotesque',sans-serif",
        fontWeight: 600,
        fontSize: 11.5,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: '#857E6F',
        margin: '14px 0 6px',
      }}
    >
      {children}
    </label>
  )
}

export function ModalSubmitButton({
  onClick,
  children,
  marginTop = 20,
}: {
  onClick: () => void
  children: ReactNode
  marginTop?: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        height: 52,
        marginTop,
        borderRadius: 13,
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
      {children}
    </button>
  )
}
