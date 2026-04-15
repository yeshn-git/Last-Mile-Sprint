const SPRINT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
)

export default function Sidebar({ stops, paces, activeStop, activePace, onStopChange, onPaceChange }) {
  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 260,
        backgroundColor: '#141414',
        borderRight: '1px solid #2A2A2A',
        padding: '20px 0',
      }}
    >
      {/* ── Title ── */}
      <div
        className="flex items-center gap-2 px-5 pb-5"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <span style={{ color: '#00BFA5', display: 'flex', alignItems: 'center' }}>
          {SPRINT_ICON}
        </span>
        <span
          style={{
            color: '#F5F5F5',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          Last-Mile Sprint
        </span>
      </div>

      {/* ── Stop selector ── */}
      <div className="flex-1 px-3 pt-4">
        <p
          className="px-2 pb-2"
          style={{
            color: '#5A5A5A',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Transfer Stop
        </p>
        <ul className="flex flex-col gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {stops.map(stop => {
            const isActive = stop === activeStop
            return (
              <li key={stop}>
                <button
                  onClick={() => onStopChange(stop)}
                  className="w-full text-left rounded-md transition-colors"
                  style={{
                    padding: '9px 12px',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#00BFA5' : '#A0A0A0',
                    backgroundColor: isActive ? 'rgba(0,191,165,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid #00BFA5' : '3px solid transparent',
                    cursor: 'pointer',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #00BFA5' : '3px solid transparent',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {stop}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Pace toggle ── */}
      <div className="px-4 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
        <p
          className="pb-3"
          style={{
            color: '#5A5A5A',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Walking Pace
        </p>
        <div
          className="flex"
          style={{
            backgroundColor: '#1C1C1C',
            borderRadius: 9999,
            padding: 4,
            gap: 2,
          }}
        >
          {paces.map(p => {
            const isActive = p === activePace
            return (
              <button
                key={p}
                onClick={() => onPaceChange(p)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#0D0D0D' : '#A0A0A0',
                  backgroundColor: isActive ? '#00BFA5' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
