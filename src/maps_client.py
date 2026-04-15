"""
Google Maps Routes API client for walking distance estimation.

Wraps the Routes API to get walking distance and duration between
an origin stop and a destination platform. Falls back to simulated
transit data if the API call fails.
"""

import logging
import os

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MAPS_API_KEY = os.getenv("MAPS_API_KEY")
ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"


def get_walking_distance(
    origin_stop: str,
    destination_platform: str,
    fallback_distance_m: float = None,
) -> dict:
    """
    Get walking distance and duration from origin stop to destination platform
    using the Google Maps Routes API.

    Falls back to simulated distance if the API call fails.

    Args:
        origin_stop: Name or address of the origin (transfer stop).
        destination_platform: Name or address of the destination (platform).
        fallback_distance_m: Fallback distance in meters from transit_feed data.
            Used if the API call fails or returns no result.

    Returns:
        Dict with:
            - distance_m: Walking distance in meters.
            - duration_s: Walking duration in seconds.
            - source: 'api' or 'fallback'.
    """
    if MAPS_API_KEY:
        try:
            result = _call_routes_api(origin_stop, destination_platform)
            if result:
                return {
                    "distance_m": result["distance_m"],
                    "duration_s": result["duration_s"],
                    "source": "api",
                }
        except Exception as e:
            logger.warning(f"Maps API call failed: {e}")

    # Fallback to simulated data
    if fallback_distance_m is not None:
        logger.warning(
            f"Using fallback distance for {origin_stop} → {destination_platform}: "
            f"{fallback_distance_m}m"
        )
        # Estimate duration assuming average walking speed of 80 m/min
        estimated_duration_s = (fallback_distance_m / 80) * 60
        return {
            "distance_m": fallback_distance_m,
            "duration_s": estimated_duration_s,
            "source": "fallback",
        }

    logger.error("No API key and no fallback distance available.")
    return {
        "distance_m": 0,
        "duration_s": 0,
        "source": "none",
    }


def _call_routes_api(origin: str, destination: str) -> dict | None:
    """
    Internal helper to call the Google Maps Routes API.

    Args:
        origin: Origin address or place name.
        destination: Destination address or place name.

    Returns:
        Dict with distance_m and duration_s, or None if no valid result.
    """
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    }

    body = {
        "origin": {
            "address": origin,
        },
        "destination": {
            "address": destination,
        },
        "travelMode": "WALK",
    }

    response = requests.post(ROUTES_API_URL, json=body, headers=headers, timeout=10)
    response.raise_for_status()

    data = response.json()

    if "routes" in data and len(data["routes"]) > 0:
        route = data["routes"][0]
        distance_m = route.get("distanceMeters", 0)
        # Duration comes as "123s" string format
        duration_str = route.get("duration", "0s")
        duration_s = int(duration_str.rstrip("s")) if isinstance(duration_str, str) else 0
        return {
            "distance_m": distance_m,
            "duration_s": duration_s,
        }

    return None
