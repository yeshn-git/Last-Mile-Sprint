function getVerdictStyle(verdict) {
  const v = verdict.toUpperCase()
  if (v.startsWith('WALK BRISKLY'))  return { bg: '#EAB308', label: 'WALK BRISKLY' }
  if (v.startsWith('SPRINT'))        return { bg: '#F97316', label: 'SPRINT' }
  if (v.startsWith('WAIT FOR NEXT')) return { bg: '#EF4444', label: 'WAIT FOR NEXT' }
  if (v.startsWith('WALK'))          return { bg: '#22C55E', label: 'WALK' }
  // fallback — try to extract leading keyword
  return { bg: '#6B7280', label: verdict.split(' — ')[0].split(':')[0].substring(0, 20) }
}

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return isoString
  }
}

function formatBuffer(bufferS) {
  const abs = Math.abs(bufferS)
  const sign = bufferS < 0 ? '−' : '+'
  if (abs < 60) return `${sign}${Math.round(abs)}s`
  const m = Math.floor(abs / 60)
  const s = Math.round(abs % 60)
  return `${sign}${m}m ${s}s`
}

function DataRow({ label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '5px 0' }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#5A5A5A',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: valueColor || '#F5F5F5',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default function DepartureCard({ departure }) {
  const { vehicle, platform, departure_time, distance_m, walk_time_s, buffer_s, verdict } = departure
  const { bg: verdictBg, label: verdictLabel } = getVerdictStyle(verdict)

  // Extract the reason text after the verdict label + dash
  const reasonText = (() => {
    const dashIdx = verdict.indexOf(' — ')
    return dashIdx !== -1 ? verdict.slice(dashIdx + 3) : ''
  })()

  const bufferColor = buffer_s < 0 ? '#EF4444' : buffer_s < 30 ? '#F97316' : buffer_s < 120 ? '#EAB308' : '#22C55E'

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#141414',
        border: '1px solid #2A2A2A',
        borderRadius: 10,
        minWidth: 0,
      }}
    >
      {/* ── Card header ── */}
      <div style={{ padding: '16px 16px 10px' }}>
        <p
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: '#F5F5F5',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {vehicle}
        </p>

        {/* Platform badge */}
        <span
          style={{
            display: 'inline-block',
            marginTop: 8,
            padding: '3px 9px',
            borderRadius: 9999,
            fontSize: 11,
            fontWeight: 600,
            color: '#00BFA5',
            backgroundColor: 'rgba(0,191,165,0.12)',
            border: '1px solid rgba(0,191,165,0.25)',
          }}
        >
          {platform}
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, backgroundColor: '#2A2A2A', margin: '0 16px' }} />

      {/* ── Data rows ── */}
      <div style={{ padding: '10px 16px 14px', flex: 1 }}>
        <DataRow label="Departs"  value={formatTime(departure_time)} />
        <DataRow label="Distance" value={`${Math.round(distance_m)}m`} />
        <DataRow label="Buffer"   value={formatBuffer(buffer_s)} valueColor={bufferColor} />
      </div>

      {/* ── Verdict banner ── */}
      <div
        style={{
          backgroundColor: verdictBg,
          padding: '10px 16px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            color: '#0D0D0D',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {verdictLabel}
        </p>
        {reasonText && (
          <p
            style={{
              margin: '3px 0 0',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(13,13,13,0.7)',
              lineHeight: 1.4,
            }}
          >
            {reasonText}
          </p>
        )}
      </div>
    </div>
  )
}
