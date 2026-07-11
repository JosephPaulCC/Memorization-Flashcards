export function Toast({ message }: { message: string }) {
  return (
    <div
      className="anim-pop"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 90,
        zIndex: 90,
        background: '#26221B',
        color: '#F7F4EC',
        padding: '11px 16px',
        borderRadius: 12,
        fontSize: 13.5,
        fontWeight: 500,
        boxShadow: '0 8px 20px rgba(0,0,0,.28)',
        maxWidth: 'min(92vw, 420px)',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  )
}
