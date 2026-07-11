export function Toggle({ checked }: { checked: boolean }) {
  return (
    <span
      style={{
        flex: 'none',
        width: 50,
        height: 30,
        borderRadius: 999,
        background: checked ? 'var(--accent, #C4551C)' : 'rgba(38,34,27,.18)',
        position: 'relative',
        transition: 'background .15s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,.25)',
          transition: 'left .15s',
        }}
      />
    </span>
  )
}

export function ToggleRow({
  title,
  description,
  checked,
  onClick,
  divider,
}: {
  title: string
  description: string
  checked: boolean
  onClick: () => void
  divider?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: 'none',
        border: 'none',
        padding: '13px 0',
        cursor: 'pointer',
        textAlign: 'left',
        touchAction: 'manipulation',
        borderBottom: divider ? '1px solid rgba(38,34,27,.08)' : undefined,
      }}
    >
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#26221B' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12.5, color: '#857E6F', marginTop: 2 }}>{description}</span>
      </span>
      <Toggle checked={checked} />
    </button>
  )
}
