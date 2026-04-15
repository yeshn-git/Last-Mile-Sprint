# 🏃 Last-Mile Sprint

**A CLI tool that tells a commuter exactly how much time they have to catch a connecting bus/metro at a transfer stop — and whether to walk, walk briskly, or sprint.**

---

## 🏙️ Vertical

**Urban Mobility — Transfer Timing Assistant**

Helps commuters at major Bengaluru transit hubs make real-time decisions about catching connecting buses and metro services, powered by simulated transit data and the Gemini API.

---

## 🧠 Approach & Architecture

Last-Mile Sprint uses a **4-module architecture**:

| Module | File | Responsibility |
|--------|------|---------------|
| **Transit Feed** | `src/transit_feed.py` | Simulated GTFS-style departure data for 5 Bengaluru stops (Majestic, Silk Board, KR Puram, Whitefield, Hebbal). Each stop has 3 connecting vehicles with departure times relative to "now". |
| **Maps Client** | `src/maps_client.py` | Wraps the Google Maps Routes API to get real walking distances. Falls back to simulated distances if the API is unavailable or fails. |
| **Pace Engine** | `src/pace_engine.py` | Defines 3 pace profiles (slow: 60m/min, normal: 80m/min, brisk: 100m/min) and calculates walk time and time buffer for each departure. |
| **Gemini Agent** | `src/gemini_agent.py` | Sends timing data to Gemini Flash and receives an actionable verdict: WALK, WALK BRISKLY, SPRINT, or WAIT FOR NEXT. Includes a local fallback if the API is unavailable. |

**Flow:**
```
CLI Input → Transit Feed → Maps Client → Pace Engine → Gemini Agent → Formatted Output
```

---

## 🚀 How to Run

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up environment variables

Copy the example file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your_actual_gemini_api_key
MAPS_API_KEY=your_actual_maps_api_key
```

> **Note:** The tool works without API keys — it falls back to simulated distances and a local verdict engine.

### 3. Run the CLI

```bash
# Default pace (normal)
python main.py --stop Majestic --pace normal

# Try different stops and paces
python main.py --stop "Silk Board" --pace brisk
python main.py --stop Hebbal --pace slow
python main.py --stop Whitefield --pace normal
python main.py --stop "KR Puram" --pace brisk
```

### 4. Run tests

```bash
python -m pytest tests/ -v
```

Or with unittest:

```bash
python -m unittest tests.test_scenarios -v
```

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
  🕐  Departs   : 14:34:12
  📏  Distance  : 350m [fallback]
  ⏱️   Walk Time : 263s (normal)
  ⏳  Buffer    : -23s
  🤖  Verdict   : WAIT FOR NEXT — The buffer is -23 seconds, you've missed this one.

  ── Departure 2 ─────────────────────────────────────────────
  🚍  Vehicle   : Metro Green Line - Nagasandra
  🔢  Platform  : Platform 1
  🕐  Departs   : 14:37:12
  📏  Distance  : 220m [fallback]
  ⏱️   Walk Time : 165s (normal)
  ⏳  Buffer    : +255s
  🤖  Verdict   : WALK — You have a comfortable 255-second buffer to reach the platform.

  ── Departure 3 ─────────────────────────────────────────────
  🚍  Vehicle   : Bus 401K - Bannerghatta
  🔢  Platform  : Bay 7
  🕐  Departs   : 14:42:12
  📏  Distance  : 500m [fallback]
  ⏱️   Walk Time : 375s (normal)
  ⏳  Buffer    : +345s
  🤖  Verdict   : WALK — With a 345-second buffer, take your time and walk comfortably.

=================================================================
  ✅  Analysis complete. Stay on schedule!
=================================================================
```

---

## 📌 Assumptions

1. **Simulated Transit Data** — Departure times are generated relative to the current time using fixed offsets (not live GTFS feeds).
2. **3 Pace Profiles** — Slow (60 m/min), Normal (80 m/min), Brisk (100 m/min) approximate real-world walking speeds.
3. **Bengaluru Stops** — 5 major transfer hubs: Majestic, Silk Board, KR Puram, Whitefield, and Hebbal.
4. **API Fallbacks** — Both the Maps API and Gemini API have graceful fallbacks, so the tool works without API keys (with simulated data and local verdicts).
5. **Walking Distance** — Distances represent the path from the arrival gate to the departure platform within the transit hub.

---

## 📄 License

MIT
