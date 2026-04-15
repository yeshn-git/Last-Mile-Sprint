"""
Simulated GTFS-style transit data for Bengaluru transfer stops.

Provides upcoming departure schedules for connecting vehicles at major
transit hubs, with walking distances from the arrival gate.
"""

from datetime import datetime, timedelta


# Simulated transit data: 5 Bengaluru transfer stops
# Each stop has 3 connecting vehicles with:
#   - name: vehicle identifier
#   - platform: platform/bay number
#   - walking_distance_m: meters from arrival gate to platform
#   - departure_offset_minutes: minutes from "now" until departure
TRANSIT_DATA = {
    "Majestic": [
        {
            "name": "Bus 500D - Electronic City",
            "platform": "Bay 3",
            "walking_distance_m": 350,
            "departure_offset_minutes": 4,
        },
        {
            "name": "Metro Green Line - Nagasandra",
            "platform": "Platform 1",
            "walking_distance_m": 220,
            "departure_offset_minutes": 7,
        },
        {
            "name": "Bus 401K - Bannerghatta",
            "platform": "Bay 7",
            "walking_distance_m": 500,
            "departure_offset_minutes": 12,
        },
    ],
    "Silk Board": [
        {
            "name": "Bus 500C - Majestic",
            "platform": "Bay 1",
            "walking_distance_m": 180,
            "departure_offset_minutes": 3,
        },
        {
            "name": "Metro Yellow Line - RV Road",
            "platform": "Platform 2",
            "walking_distance_m": 400,
            "departure_offset_minutes": 6,
        },
        {
            "name": "Bus 356 - Marathahalli",
            "platform": "Bay 4",
            "walking_distance_m": 300,
            "departure_offset_minutes": 15,
        },
    ],
    "KR Puram": [
        {
            "name": "Metro Purple Line - Whitefield",
            "platform": "Platform 1",
            "walking_distance_m": 150,
            "departure_offset_minutes": 2,
        },
        {
            "name": "Bus 331 - Majestic",
            "platform": "Bay 2",
            "walking_distance_m": 280,
            "departure_offset_minutes": 5,
        },
        {
            "name": "Bus 500A - Silk Board",
            "platform": "Bay 5",
            "walking_distance_m": 420,
            "departure_offset_minutes": 10,
        },
    ],
    "Whitefield": [
        {
            "name": "Bus 335E - KR Puram",
            "platform": "Bay 1",
            "walking_distance_m": 200,
            "departure_offset_minutes": 5,
        },
        {
            "name": "Metro Purple Line - Majestic",
            "platform": "Platform 1",
            "walking_distance_m": 320,
            "departure_offset_minutes": 8,
        },
        {
            "name": "Bus 500SH - Silk Board",
            "platform": "Bay 3",
            "walking_distance_m": 450,
            "departure_offset_minutes": 14,
        },
    ],
    "Hebbal": [
        {
            "name": "Bus 252A - Majestic",
            "platform": "Bay 2",
            "walking_distance_m": 250,
            "departure_offset_minutes": 3,
        },
        {
            "name": "Bus 401H - KR Puram",
            "platform": "Bay 5",
            "walking_distance_m": 380,
            "departure_offset_minutes": 6,
        },
        {
            "name": "Metro Green Line - Nagasandra",
            "platform": "Platform 1",
            "walking_distance_m": 170,
            "departure_offset_minutes": 11,
        },
    ],
}


def get_upcoming_departures(stop_name: str) -> list[dict]:
    """
    Return the next 3 departures from a given transfer stop, sorted by time.

    Each departure dict contains:
        - name: vehicle identifier
        - platform: platform/bay number
        - walking_distance_m: meters from arrival gate
        - departure_time: absolute datetime of departure

    Args:
        stop_name: Name of the transfer stop (case-insensitive match).

    Returns:
        List of departure dicts sorted by departure_time.

    Raises:
        ValueError: If the stop name is not found in the transit data.
    """
    # Case-insensitive lookup
    matched_key = None
    for key in TRANSIT_DATA:
        if key.lower() == stop_name.lower():
            matched_key = key
            break

    if matched_key is None:
        available = ", ".join(TRANSIT_DATA.keys())
        raise ValueError(
            f"Stop '{stop_name}' not found. Available stops: {available}"
        )

    now = datetime.now()
    departures = []

    for vehicle in TRANSIT_DATA[matched_key]:
        departure_time = now + timedelta(minutes=vehicle["departure_offset_minutes"])
        departures.append(
            {
                "name": vehicle["name"],
                "platform": vehicle["platform"],
                "walking_distance_m": vehicle["walking_distance_m"],
                "departure_time": departure_time,
            }
        )

    # Sort by departure time and return the next 3
    departures.sort(key=lambda d: d["departure_time"])
    return departures[:3]
