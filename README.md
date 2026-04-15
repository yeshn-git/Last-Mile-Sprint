# 🏃 Last-Mile Sprint

**A CLI tool that tells a commuter exactly how much time they have to catch a connecting bus/metro at a transfer stop — and whether to walk, walk briskly, or sprint.**

---

## 🏙️ Vertical

**Urban Mobility — Transfer Timing Assistant**

Helps commuters at major Bengaluru transit hubs make real-time decisions about catching connecting buses and metro services, powered by simulated transit data and a smart local verdict engine.

---

## 🧠 Approach & Architecture

Last-Mile Sprint uses a **4-module architecture**:

| Module | File | Responsibility |
|--------|------|---------------|
| **Transit Feed** | `src/transit_feed.py` | Simulated GTFS-style departure data for 5 Bengaluru stops (Majestic, Silk Board, KR Puram, Whitefield, Hebbal). Each stop has 3 connecting vehicles with departure times relative to "now". |
| **Maps Client** | `src/maps_client.py` | Wraps the Google Maps Routes API to get real walking distances. Falls back to simulated distances if the API is unavailable or fails. |
| **Pace Engine** | `src/pace_engine.py` | Defines 3 pace profiles (slow: 60m/min, normal: 80m/min, brisk: 100m/min) and calculates walk time and time buffer for each departure. |
| **Smart Verdict Engine** | `src/gemini_agent.py` | Local rule-based engine that analyzes buffer time and provides actionable verdicts: WALK / WALK BRISKLY / SPRINT / WAIT FOR NEXT. No external API required. |

**Flow:**
```
CLI Input → Transit Feed → Maps Client → Pace Engine → Verdict Engine → Formatted Output
```

---

## 🚀 How to Run

### 1. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Maps API key (optional — falls back to simulated distances):
```
MAPS_API_KEY=your_google_maps_api_key
```

> **Note:** No Gemini API key required. Verdicts are generated locally with zero latency.

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the CLI

```bash
python main.py --stop Majestic --pace normal
```

Try different stops and paces:

```bash
python main.py --stop "Silk Board" --pace brisk
python main.py --stop Hebbal --pace slow
python main.py --stop Whitefield --pace normal
python main.py --stop "KR Puram" --pace brisk
```

### 4. Run tests

```bash
python -m pytest tests/ -v
```

---

## 🌐 Web UI (React Frontend + FastAPI Backend)

### Quick Start (both servers at once)

```bash
bash start.sh
```

This starts:
- **Backend** → `http://localhost:8000`
- **Frontend** → `http://localhost:5173`

### Manual Setup

#### Backend (FastAPI)

```bash
pip install -r requirements.txt
uvicorn backend.server:app --reload --port 8000
```

API endpoints:
| Method | Path       | Description                          |
|--------|-----------|--------------------------------------|
| `POST` | `/analyze` | Analyze a stop + pace, return departures |
| `GET`  | `/health`  | Liveness check → `{ "status": "ok" }` |

Example request:
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"stop": "Majestic", "pace": "normal"}'
```

#### Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### UI Screenshot

> _Screenshot placeholder — run both servers and open http://localhost:5173_
>
> ![Last-Mile Sprint UI](docs/screenshot.png)

---

## 📋 Sample Output

```
=================================================================
  🚌  LAST-MILE SPRINT — Transfer Timing Assistant
  📍  Stop: Majestic  |  🚶 Pace: NORMAL
=================================================================

  ── Departure 1 ─────────────────────────────────────────────
  🚍  Vehicle   : Bus 500D - Electronic City
  🔢  Platform  : Bay 3
  🕐  Departs   : 11:26:58
  📏  Distance  : 1220m
  ⏱️   Walk Time : 915s (normal)
  ⏳  Buffer    : -676s
  🤖  Verdict   : WAIT FOR NEXT — The buffer is -676 seconds, meaning the bus departs well before you arrive.

  ── Departure 2 ─────────────────────────────────────────────
  🚍  Vehicle   : Metro Green Line - Nagasandra
  🔢  Platform  : Platform 1
  🕐  Departs   : 11:29:58
  📏  Distance  : 178m
  ⏱️   Walk Time : 134s (normal)
  ⏳  Buffer    : +281s
  🤖  Verdict   : WALK — You have a comfortable 281-second buffer to reach the platform.

  ── Departure 3 ─────────────────────────────────────────────
  🚍  Vehicle   : Bus 401K - Bannerghatta
  🔢  Platform  : Bay 7
  🕐  Departs   : 11:34:58
  📏  Distance  : 953m
  ⏱️   Walk Time : 715s (normal)
  ⏳  Buffer    : -3s
  🤖  Verdict   : WAIT FOR NEXT — The buffer is -3 seconds, meaning the vehicle departs before you arrive.

=================================================================
  ✅  Analysis complete. Stay on schedule!
=================================================================
```

---

## 📌 Assumptions

1. **Simulated Transit Data** — Departure times are generated relative to the current time using fixed offsets (not live GTFS feeds).
2. **3 Pace Profiles** — Slow (60 m/min), Normal (80 m/min), Brisk (100 m/min) approximate real-world walking speeds.
3. **Bengaluru Stops** — 5 major transfer hubs: Majestic, Silk Board, KR Puram, Whitefield, and Hebbal.
4. **API Fallbacks** — The Maps API has a graceful fallback to simulated distances, so the tool works fully without any API key. Verdicts are always generated locally with zero latency.
5. **Walking Distance** — Distances represent the path from the arrival gate to the departure platform within the transit hub.

---

## 📄 License

MIT
