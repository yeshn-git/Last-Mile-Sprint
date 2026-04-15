import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import DepartureCard from './components/DepartureCard'
import LoadingSpinner from './components/LoadingSpinner'
import MapBackground from './components/MapBackground'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STOPS = ['Majestic', 'Silk Board', 'KR Puram', 'Whitefield', 'Hebbal']
const PACES = ['slow', 'normal', 'brisk']

export default function App() {
  const [stop, setStop]             = useState('Majestic')
  const [pace, setPace]             = useState('normal')
  const [departures, setDepartures] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

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
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        stops={STOPS}
        paces={PACES}
        activeStop={stop}
        activePace={pace}
        onStopChange={setStop}
        onPaceChange={setPace}
      />

      {/* ── Main panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── Map fills the entire panel (z-0) ── */}
        <MapBackground activeStop={stop} />

        {/* ── UI layer floats above the map (z-10+) ── */}
        <div className="relative flex flex-col h-full" style={{ zIndex: 10 }}>

          {/* Header bar */}
          <div
            className="shrink-0 px-6 py-3 flex items-center gap-3 border-b"
            style={{
              backgroundColor: 'rgba(10,15,26,0.80)',
              borderColor: '#1a3030',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ color: '#00BFA5', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Live Departures
            </span>
            <span style={{ color: '#1a3030' }}>·</span>
            <span style={{ color: '#5A5A5A', fontSize: 12 }}>{stop}</span>
            <span style={{ color: '#1a3030' }}>·</span>
            <span style={{ color: '#5A5A5A', fontSize: 12, textTransform: 'capitalize' }}>{pace} pace</span>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto p-6">

            {loading && (
              <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <LoadingSpinner />
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <div
                  className="px-5 py-4 rounded-lg border text-center"
                  style={{
                    backgroundColor: 'rgba(13,13,13,0.85)',
                    backdropFilter: 'blur(4px)',
                    borderColor: '#EF4444',
                    maxWidth: 360,
                  }}
                >
                  <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Connection Error</p>
                  <p style={{ color: '#A0A0A0', fontSize: 12 }}>{error}</p>
                </div>
                <button
                  onClick={fetchDepartures}
                  className="px-4 py-2 rounded-md text-sm font-semibold"
                  style={{ backgroundColor: '#00BFA5', color: '#0D0D0D', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00897B'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00BFA5'}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && departures.length > 0 && (
              <div
                className="grid gap-5"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
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
        </div>
      </div>
    </div>
  )
}
