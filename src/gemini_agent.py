"""
Gemini AI agent for transfer verdict decisions.

Uses the Gemini Flash model to analyze commuter timing data and
provide an actionable verdict: WALK, WALK BRISKLY, SPRINT, or WAIT FOR NEXT.
"""

import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def get_transfer_verdict(
    stop_name: str,
    vehicle_name: str,
    buffer_seconds: float,
    walk_time_seconds: float,
    distance_meters: float,
) -> str:
    """
    Get a transfer verdict from Gemini based on timing data.

    Calls the Gemini Flash model with a structured prompt to determine
    whether the commuter should WALK, WALK BRISKLY, SPRINT, or WAIT FOR NEXT.

    Args:
        stop_name: Name of the transfer stop.
        vehicle_name: Name of the connecting vehicle.
        buffer_seconds: Time buffer in seconds (negative = already missed).
        walk_time_seconds: Estimated walk time in seconds.
        distance_meters: Walking distance in meters.

    Returns:
        Raw text response from Gemini containing the verdict and reason.
    """
    prompt = _build_prompt(
        stop_name, vehicle_name, buffer_seconds, walk_time_seconds, distance_meters
    )

    try:
        response = _client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        return f"[Gemini unavailable: {e}] — Fallback: {_local_verdict(buffer_seconds)}"


def _build_prompt(
    stop_name: str,
    vehicle_name: str,
    buffer_seconds: float,
    walk_time_seconds: float,
    distance_meters: float,
) -> str:
    """Build the structured prompt for Gemini."""
    return (
        f"You are a transit timing assistant. A commuter is at {stop_name} and needs "
        f"to catch '{vehicle_name}'.\n\n"
        f"Here are the facts:\n"
        f"- Walking distance to platform: {distance_meters:.0f} meters\n"
        f"- Estimated walk time: {walk_time_seconds:.0f} seconds\n"
        f"- Time buffer after walking: {buffer_seconds:.0f} seconds "
        f"({'positive — commuter arrives before departure' if buffer_seconds >= 0 else 'negative — vehicle departs before commuter arrives'})\n\n"
        f"Based on this data, respond in exactly ONE sentence with one of these "
        f"verdicts at the start: WALK / WALK BRISKLY / SPRINT / WAIT FOR NEXT — "
        f"followed by a short reason that includes the buffer time in seconds.\n\n"
        f"Example: 'WALK — You have a comfortable 180-second buffer to reach the platform.'\n"
        f"Example: 'SPRINT — With only 15 seconds of buffer, you need to run to make it.'\n"
        f"Example: 'WAIT FOR NEXT — The buffer is -30 seconds, meaning you have already missed this departure.'"
    )


def _local_verdict(buffer_seconds: float) -> str:
    """Provide a local fallback verdict when Gemini is unavailable."""
    if buffer_seconds < 0:
        return f"WAIT FOR NEXT — Buffer is {buffer_seconds:.0f}s, connection already missed."
    elif buffer_seconds < 30:
        return f"SPRINT — Only {buffer_seconds:.0f}s buffer, run to make it!"
    elif buffer_seconds < 120:
        return f"WALK BRISKLY — {buffer_seconds:.0f}s buffer, pick up the pace."
    else:
        return f"WALK — Comfortable {buffer_seconds:.0f}s buffer, no rush."
