"""
Gemini AI agent for transfer verdict decisions.

Uses the Gemini Flash model to analyze commuter timing data and
provide an actionable verdict: WALK, WALK BRISKLY, SPRINT, or WAIT FOR NEXT.

Quota strategy:
  - Try gemini-2.5-flash first (primary, best quality)
  - On 429 quota exhaustion, fall back to gemini-1.5-flash (separate quota bucket)
  - On any other failure, use local rule-based fallback
"""

import os
import time
import traceback

from google import genai
from google.genai.errors import ClientError
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Debug: confirm key was loaded from .env
print(f"[gemini_agent] Key loaded: {bool(GEMINI_API_KEY)}")

_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

PRIMARY_MODEL  = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-1.5-flash"


def _call_model(model: str, prompt: str) -> str:
    """Call a specific Gemini model and return the text response."""
    response = _client.models.generate_content(model=model, contents=prompt)
    return response.text.strip()


def get_transfer_verdict(
    stop_name: str,
    vehicle_name: str,
    buffer_seconds: float,
    walk_time_seconds: float,
    distance_meters: float,
) -> str:
    """
    Get a transfer verdict from Gemini based on timing data.

    Tries gemini-2.5-flash; on 429 falls back to gemini-1.5-flash;
    on any other error falls back to local rule-based verdict.
    """
    if _client is None:
        print("[gemini_agent] No API key — using local fallback verdict.")
        return _local_verdict(buffer_seconds)

    prompt = _build_prompt(
        stop_name, vehicle_name, buffer_seconds, walk_time_seconds, distance_meters
    )

    # ── Attempt 1: primary model ──────────────────────────────────────────────
    try:
        result = _call_model(PRIMARY_MODEL, prompt)
        print(f"[gemini_agent] {PRIMARY_MODEL} OK")
        return result
    except ClientError as e:
        if e.code == 429:
            print(f"[gemini_agent] {PRIMARY_MODEL} quota exhausted (429) — trying {FALLBACK_MODEL}")
        else:
            print(f"[gemini_agent] {PRIMARY_MODEL} ClientError {e.code}: {e.message}")
            traceback.print_exc()
    except Exception as e:
        print(f"[gemini_agent] {PRIMARY_MODEL} unexpected error: {type(e).__name__}: {e}")
        traceback.print_exc()

    # ── Attempt 2: fallback model (separate quota) ────────────────────────────
    try:
        result = _call_model(FALLBACK_MODEL, prompt)
        print(f"[gemini_agent] {FALLBACK_MODEL} OK (fallback)")
        return result
    except ClientError as e:
        if e.code == 429:
            print(f"[gemini_agent] {FALLBACK_MODEL} also quota exhausted — using local verdict")
        else:
            print(f"[gemini_agent] {FALLBACK_MODEL} ClientError {e.code}: {e.message}")
            traceback.print_exc()
    except Exception as e:
        print(f"[gemini_agent] {FALLBACK_MODEL} unexpected error: {type(e).__name__}: {e}")
        traceback.print_exc()

    # ── Attempt 3: retry primary after brief wait ─────────────────────────────
    print("[gemini_agent] Waiting 3s then retrying primary…")
    time.sleep(3)
    try:
        result = _call_model(PRIMARY_MODEL, prompt)
        print(f"[gemini_agent] {PRIMARY_MODEL} OK (retry)")
        return result
    except Exception as e:
        print(f"[gemini_agent] All Gemini attempts failed. Last error: {type(e).__name__}: {e}")

    return _local_verdict(buffer_seconds)


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
