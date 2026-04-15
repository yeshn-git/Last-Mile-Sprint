"""
Last-Mile Sprint — FastAPI Backend Server

Exposes:
  POST /analyze  — run the full transit analysis pipeline for a stop + pace
  GET  /health   — liveness check
"""

import sys
import os

# Ensure project root is on the path so src.* imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.transit_feed import get_upcoming_departures
from src.pace_engine import calculate_walk_time, get_time_buffer
from src.maps_client import get_walking_distance
from src.gemini_agent import get_transfer_verdict

app = FastAPI(title="Last-Mile Sprint API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ─────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    stop: str
    pace: str = "normal"


class DepartureResult(BaseModel):
    vehicle: str
    platform: str
    departure_time: str       # ISO-8601 string
    distance_m: float
    walk_time_s: float
    buffer_s: float
    verdict: str


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=list[DepartureResult])
def analyze(req: AnalyzeRequest):
    stop = req.stop.strip()
    pace = req.pace.strip().lower()

    if pace not in ("slow", "normal", "brisk"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid pace '{pace}'. Must be one of: slow, normal, brisk",
        )

    # 1. Fetch upcoming departures
    try:
        departures = get_upcoming_departures(stop)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    results: list[DepartureResult] = []

    for dep in departures:
        vehicle_name     = dep["name"]
        platform         = dep["platform"]
        departure_time   = dep["departure_time"]
        sim_distance_m   = dep["walking_distance_m"]

        # 2. Walking distance (Maps API with fallback)
        distance_info = get_walking_distance(
            origin_stop=f"{stop} Bus Station, Bengaluru",
            destination_platform=f"{platform}, {stop}, Bengaluru",
            fallback_distance_m=sim_distance_m,
        )
        distance_m = distance_info["distance_m"]

        # 3. Walk time and time buffer
        walk_time_s = calculate_walk_time(distance_m, pace)
        buffer_s    = get_time_buffer(departure_time, walk_time_s)

        # 4. Gemini verdict
        verdict = get_transfer_verdict(
            stop_name=stop,
            vehicle_name=vehicle_name,
            buffer_seconds=buffer_s,
            walk_time_seconds=walk_time_s,
            distance_meters=distance_m,
        )

        results.append(
            DepartureResult(
                vehicle=vehicle_name,
                platform=platform,
                departure_time=departure_time.isoformat(),
                distance_m=round(distance_m, 1),
                walk_time_s=round(walk_time_s, 1),
                buffer_s=round(buffer_s, 1),
                verdict=verdict,
            )
        )

    return results
