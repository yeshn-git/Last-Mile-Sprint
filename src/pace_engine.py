"""
Pace calculation engine for transfer timing.

Defines walking pace profiles and computes walk times and time buffers
to determine if a commuter can make a connection.
"""

from datetime import datetime


# Pace profiles: meters per minute
PACE_PROFILES = {
    "slow": 60,      # ~3.6 km/h — leisurely walk
    "normal": 80,    # ~4.8 km/h — average walking speed
    "brisk": 100,    # ~6.0 km/h — fast walk / light jog
}


def calculate_walk_time(distance_meters: float, pace_profile: str = "normal") -> float:
    """
    Calculate the time in seconds to walk a given distance at a specified pace.

    Args:
        distance_meters: Distance to walk in meters.
        pace_profile: One of 'slow', 'normal', or 'brisk'.

    Returns:
        Walk time in seconds.

    Raises:
        ValueError: If pace_profile is not recognized.
    """
    profile = pace_profile.lower()
    if profile not in PACE_PROFILES:
        available = ", ".join(PACE_PROFILES.keys())
        raise ValueError(
            f"Unknown pace profile '{pace_profile}'. Choose from: {available}"
        )

    meters_per_minute = PACE_PROFILES[profile]
    walk_time_minutes = distance_meters / meters_per_minute
    return walk_time_minutes * 60  # convert to seconds


def get_time_buffer(departure_time: datetime, walk_time_seconds: float) -> float:
    """
    Calculate the time buffer between finishing walking and the departure.

    A positive buffer means the commuter arrives before the vehicle departs.
    A negative buffer means the vehicle has already departed (missed).

    Args:
        departure_time: Scheduled departure datetime.
        walk_time_seconds: Time needed to walk to the platform in seconds.

    Returns:
        Buffer in seconds (negative if the connection is missed).
    """
    now = datetime.now()
    time_until_departure = (departure_time - now).total_seconds()
    buffer = time_until_departure - walk_time_seconds
    return buffer
