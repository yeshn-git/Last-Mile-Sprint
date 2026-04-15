import { useState, useEffect, useCallback, Component } from 'react'
import Sidebar from './components/Sidebar'
import DepartureCard from './components/DepartureCard'
import LoadingSpinner from './components/LoadingSpinner'
import MapBackground from './components/MapBackground'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STOPS = ['Majestic', 'Silk Board', 'KR Puram', 'Whitefield', 'Hebbal']
const PACES = ['slow', 'normal', 'brisk']

// ── Error boundary — prevents blank page on any render crash ─────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', backgroundColor: '#0D0D0D', flexDirection: 'column', gap: 12,
        }}>
          <p style={{ color: '#EF4444', fontFamily: 'monospace', fontSize: 13, margin: 0 }}>
            Render error: {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ padding: '6px 16px', backgroundColor: '#00BFA5', color: '#0D0D0D',
                     border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Main app ──────────────────────────────────────────────────────────────────
function AppInner() {
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
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Map layer — position:absolute, fills parent, z-index 0 */}
        <MapBackground activeStop={stop} />

        {/* UI layer — flex-1 so it fills height; z-index above map */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Header bar */}
          <div
            style={{
              flexShrink: 0,
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #1a3030',
              backgroundColor: 'rgba(10,15,26,0.85)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ color: '#00BFA5', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Live Departures
            </span>
            <span style={{ color: '#2A2A2A' }}>·</span>
            <span style={{ color: '#5A5A5A', fontSize: 12 }}>{stop}</span>
            <span style={{ color: '#2A2A2A' }}>·</span>
            <span style={{ color: '#5A5A5A', fontSize: 12, textTransform: 'capitalize' }}>{pace} pace</span>
          </div>

          {/* Scrollable cards area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <LoadingSpinner />
              </div>
            )}

            {!loading && error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 8,
                  border: '1px solid #EF4444',
                  backgroundColor: 'rgba(13,13,13,0.9)',
                  backdropFilter: 'blur(4px)',
                  maxWidth: 360,
                  textAlign: 'center',
                }}>
                  <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>Connection Error</p>
                  <p style={{ color: '#A0A0A0', fontSize: 12, margin: 0 }}>{error}</p>
                </div>
                <button
                  onClick={fetchDepartures}
                  style={{ padding: '8px 20px', backgroundColor: '#00BFA5', color: '#0D0D0D',
                           border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00897B'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00BFA5'}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && departures.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
              }}>
                {departures.map((dep, i) => (
                  <DepartureCard key={i} departure={dep} />
                ))}
              </div>
            )}

            {!loading && !error && departures.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: '#5A5A5A', fontSize: 13 }}>No departures found for {stop}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}
