import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import DepartureCard from './components/DepartureCard'
import LoadingSpinner from './components/LoadingSpinner'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STOPS = ['Majestic', 'Silk Board', 'KR Puram', 'Whitefield', 'Hebbal']
const PACES = ['slow', 'normal', 'brisk']

export default function App() {
  const [stop, setStop]           = useState('Majestic')
  const [pace, setPace]           = useState('normal')
  const [departures, setDepartures] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const fetchDepartures = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stop, pace }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setDepartures(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch departures')
      setDepartures([])
    } finally {
      setLoading(false)
    }
  }, [stop, pace])

  useEffect(() => {
    fetchDepartures()
  }, [fetchDepartures])

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <Sidebar
        stops={STOPS}
        paces={PACES}
        activeStop={stop}
        activePace={pace}
        onStopChange={setStop}
        onPaceChange={setPace}
      />

      {/* ── Main canvas ── */}
      <main
        className="flex-1 overflow-auto relative"
        style={{
          backgroundColor: '#0a0f1a',
          backgroundImage: `
            linear-gradient(rgba(32,178,170,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(32,178,170,0.07) 1px, transparent 1px),
            linear-gradient(rgba(32,178,170,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(32,178,170,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
        }}
      >
        {/* City watermark */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 200,
            fontWeight: 900,
            color: '#ffffff',
            opacity: 0.03,
            letterSpacing: '0.1em',
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 0,
          }}
        >
          BENGALURU
        </span>

        {/* Animated platform ping dots */}
        {[
          { left: '30%', top: '40%' },
          { left: '50%', top: '40%' },
          { left: '70%', top: '40%' },
        ].map((pos, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Ping ring */}
            <span
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,191,165,0.4)',
                transform: 'translate(-50%, -50%)',
                animation: `ping 1.5s cubic-bezier(0,0,0.2,1) infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
            {/* Solid dot */}
            <span
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#00BFA5',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </span>
        ))}

        <style>{`
          @keyframes ping {
            75%, 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
          }
        `}</style>
        {/* Header bar */}
        <div
          className="sticky top-0 z-10 px-6 py-3 flex items-center gap-3 border-b"
          style={{ backgroundColor: 'rgba(13,13,13,0.85)', borderColor: '#2A2A2A', backdropFilter: 'blur(8px)' }}
        >
          <span style={{ color: '#00BFA5', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Departures
          </span>
          <span style={{ color: '#2A2A2A' }}>·</span>
          <span style={{ color: '#5A5A5A', fontSize: 12 }}>{stop}</span>
          <span style={{ color: '#2A2A2A' }}>·</span>
          <span style={{ color: '#5A5A5A', fontSize: 12, textTransform: 'capitalize' }}>{pace} pace</span>
        </div>

        {/* Content area */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <LoadingSpinner />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <div
                className="px-5 py-4 rounded-lg border text-center"
                style={{ backgroundColor: '#1C1C1C', borderColor: '#EF4444', maxWidth: 360 }}
              >
                <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Connection Error</p>
                <p style={{ color: '#A0A0A0', fontSize: 12 }}>{error}</p>
              </div>
              <button
                onClick={fetchDepartures}
                className="px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#00BFA5', color: '#0D0D0D', fontSize: 13 }}
                onMouseEnter={e => e.target.style.backgroundColor = '#00897B'}
                onMouseLeave={e => e.target.style.backgroundColor = '#00BFA5'}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && departures.length > 0 && (
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {departures.map((dep, i) => (
                <DepartureCard key={i} departure={dep} />
              ))}
            </div>
          )}

          {!loading && !error && departures.length === 0 && (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <p style={{ color: '#5A5A5A', fontSize: 13 }}>No departures found for {stop}.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
