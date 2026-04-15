export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(0,191,165,0.2)',
          borderTopColor: '#00BFA5',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#5A5A5A', fontSize: 12, margin: 0 }}>Loading departures…</p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
