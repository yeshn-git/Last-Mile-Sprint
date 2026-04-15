"""
Smart Verdict Engine — local rule-based transit timing decisions.

No external API calls. Analyzes buffer time and walking distance
to produce an actionable verdict: WALK / WALK BRISKLY / SPRINT / WAIT FOR NEXT.
"""


def get_transfer_verdict(
    stop_name: str,
    vehicle_name: str,
    buffer_seconds: float,
    walk_time_seconds: float,
    distance_meters: float,
) -> str:
    """
    Return a one-sentence transfer verdict based on timing data.

    Args:
        stop_name: Name of the transfer stop (unused in logic, kept for API compat).
        vehicle_name: Name of the connecting vehicle.
        buffer_seconds: Seconds between arriving at platform and departure.
                        Negative means the vehicle departs before you arrive.
        walk_time_seconds: Estimated walk time in seconds (unused in logic, kept for API compat).
        distance_meters: Walking distance in metres (unused in logic, kept for API compat).

    Returns:
        A verdict string starting with WALK / WALK BRISKLY / SPRINT / WAIT FOR NEXT.
    """
    if buffer_seconds < 0:
        return (
            f"WAIT FOR NEXT — Buffer is {abs(int(buffer_seconds))}s, "
            f"you have already missed this departure."
        )
    elif buffer_seconds < 30:
        return (
            f"SPRINT — Only {int(buffer_seconds)}s buffer. "
            f"Run now to make it to {vehicle_name}."
        )
    elif buffer_seconds < 120:
        return (
            f"WALK BRISKLY — {int(buffer_seconds)}s buffer. "
            f"Pick up the pace to reach the platform."
        )
    else:
        return (
            f"WALK — Comfortable {int(buffer_seconds)}s buffer. "
            f"No rush, walk to {vehicle_name}."
        )
