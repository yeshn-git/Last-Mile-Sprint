import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

const STOPS = {
  Majestic:     { lat: 12.9767, lng: 77.5713 },
  'Silk Board': { lat: 12.9172, lng: 77.6231 },
  'KR Puram':   { lat: 13.0048, lng: 77.6952 },
  Whitefield:   { lat: 12.9698, lng: 77.7499 },
  Hebbal:       { lat: 13.0450, lng: 77.5940 },
}

const DARK_STYLES = [
  { elementType: 'geometry',           stylers: [{ color: '#0a0f1a' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#20b2aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0f1a' }] },
  { featureType: 'road', elementType: 'geometry',
    stylers: [{ color: '#1a2a2a' }] },
  { featureType: 'road', elementType: 'geometry.stroke',
    stylers: [{ color: '#0f1f1f' }] },
  { featureType: 'road.highway', elementType: 'geometry',
    stylers: [{ color: '#1e3535' }] },
  { featureType: 'transit', elementType: 'geometry',
    stylers: [{ color: '#0f3030' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill',
    stylers: [{ color: '#00bfa5' }] },
  { featureType: 'water', elementType: 'geometry',
    stylers: [{ color: '#050d0d' }] },
  { featureType: 'poi', elementType: 'geometry',
    stylers: [{ color: '#0d1a1a' }] },
]

const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 }
const API_KEY = import.meta.env.VITE_MAPS_API_KEY

// CSS grid shown immediately (and as fallback if Maps fails)
const CSS_GRID_STYLE = {
  position: 'absolute',
  inset: 0,
  backgroundColor: '#0a0f1a',
  backgroundImage: `
    linear-gradient(rgba(32,178,170,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(32,178,170,0.07) 1px, transparent 1px),
    linear-gradient(rgba(32,178,170,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(32,178,170,0.03) 1px, transparent 1px)
  `,
  backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
}

let loaderInstance = null
function getLoader() {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: API_KEY || '',
      version: 'weekly',
      libraries: ['geometry'],
    })
  }
  return loaderInstance
}

export default function MapBackground({ activeStop }) {
  const mapDivRef    = useRef(null)
  const mapObj       = useRef(null)
  const markersRef   = useRef({})
  const infoWindowRef = useRef(null)
  const polylineRef  = useRef(null)
  // mapLoaded: true = real map is ready; false = show CSS grid
  const [mapLoaded, setMapLoaded] = useState(false)

  // ── Load Google Maps after initial render (500ms delay) ───────────────────
  useEffect(() => {
    if (!API_KEY) return

    const timer = setTimeout(() => {
      getLoader().load()
        .then((google) => {
          if (!mapDivRef.current || mapObj.current) return

          const map = new google.maps.Map(mapDivRef.current, {
            center: BENGALURU_CENTER,
            zoom: 11,
            styles: DARK_STYLES,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM,
            },
            gestureHandling: 'greedy',
          })
          mapObj.current = map
          infoWindowRef.current = new google.maps.InfoWindow()

          Object.entries(STOPS).forEach(([name, coords]) => {
            const marker = new google.maps.Marker({
              position: coords,
              map,
              title: name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#00BFA5',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 1.5,
              },
            })
            marker.addListener('click', () => {
              infoWindowRef.current.setContent(`
                <div style="background:#141414;color:#F5F5F5;padding:8px 12px;
                  border-radius:6px;font-family:Inter,sans-serif;font-size:12px;
                  border:1px solid #2A2A2A;">
                  <div style="color:#00BFA5;font-weight:700;">${name}</div>
                  <div style="color:#A0A0A0;">Transit stop</div>
                </div>`)
              infoWindowRef.current.open({ anchor: marker, map })
            })
            markersRef.current[name] = marker
          })

          setMapLoaded(true)
        })
        .catch(err => {
          console.warn('[MapBackground] Google Maps failed to load, using CSS grid fallback:', err.message)
          // mapLoaded stays false → CSS grid stays visible
        })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // ── Pan + highlight when active stop changes ──────────────────────────────
  useEffect(() => {
    if (!mapObj.current || !activeStop) return
    const google = window.google
    if (!google) return

    const coords = STOPS[activeStop]
    if (!coords) return

    mapObj.current.panTo(coords)
    mapObj.current.panBy(-140, 0)

    const marker = markersRef.current[activeStop]
    if (marker && infoWindowRef.current) {
      infoWindowRef.current.setContent(`
        <div style="background:#141414;color:#F5F5F5;padding:8px 12px;
          border-radius:6px;font-family:Inter,sans-serif;font-size:12px;
          border:1px solid #00BFA5;">
          <div style="color:#00BFA5;font-weight:700;">${activeStop}</div>
          <div style="color:#A0A0A0;">Selected stop</div>
        </div>`)
      infoWindowRef.current.open({ anchor: marker, map: mapObj.current })
    }

    Object.entries(markersRef.current).forEach(([name, m]) => {
      m.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: name === activeStop ? 11 : 7,
        fillColor: name === activeStop ? '#00BFA5' : '#005f52',
        fillOpacity: name === activeStop ? 1 : 0.6,
        strokeColor: name === activeStop ? '#ffffff' : '#00BFA5',
        strokeWeight: name === activeStop ? 2 : 1,
      })
    })

    if (polylineRef.current) polylineRef.current.setMap(null)

    const line = new google.maps.Polyline({
      path: [
        new google.maps.LatLng(coords.lat, coords.lng),
        new google.maps.LatLng(coords.lat, coords.lng + 0.025),
      ],
      geodesic: true,
      strokeColor: '#00BFA5',
      strokeOpacity: 0,
      strokeWeight: 2,
      icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#00BFA5', scale: 3 },
                offset: '0', repeat: '16px' }],
      map: mapObj.current,
    })
    polylineRef.current = line

    let count = 0
    const interval = setInterval(() => {
      count = (count + 1) % 200
      const icons = line.get('icons')
      icons[0].offset = `${(count / 2) % 100}%`
      line.set('icons', icons)
    }, 40)
    return () => clearInterval(interval)
  }, [activeStop])

  return (
    <>
      {/* CSS grid is always rendered; hidden only when real map has loaded */}
      <div style={{ ...CSS_GRID_STYLE, opacity: mapLoaded ? 0 : 1, transition: 'opacity 0.6s ease' }} />

      {/* Map div — always in DOM so the ref is available; invisible until loaded */}
      <div
        ref={mapDivRef}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: mapLoaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </>
  )
}
