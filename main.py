"""
Last-Mile Sprint — CLI Entry Point

A CLI tool that tells a commuter exactly how much time they have to catch
a connecting bus/metro at a transfer stop, and whether to walk, walk briskly,
or sprint.
"""

import argparse
import sys

# Ensure UTF-8 output for emojis on Windows terminals
if sys.stdout.encoding.lower() != 'utf-8':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv

load_dotenv()

from src.transit_feed import get_upcoming_departures
from src.pace_engine import calculate_walk_time, get_time_buffer
from src.maps_client import get_walking_distance
from src.gemini_agent import get_transfer_verdict


def main():
    parser = argparse.ArgumentParser(
        description="Last-Mile Sprint — Transfer Timing Assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python main.py --stop Majestic --pace normal\n"
            "  python main.py --stop \"Silk Board\" --pace brisk\n"
            "  python main.py --stop Hebbal --pace slow\n"
        ),
    )
    parser.add_argument(
        "--stop",
        type=str,
        required=True,
        help="Transfer stop name (e.g., Majestic, Silk Board, KR Puram, Whitefield, Hebbal)",
    )
    parser.add_argument(
        "--pace",
        type=str,
        default="normal",
        choices=["slow", "normal", "brisk"],
        help="Walking pace profile (default: normal)",
    )
    args = parser.parse_args()

    stop_name = args.stop
    pace = args.pace

    # Header
    print()
    print("=" * 65)
    print(f"  🚌  LAST-MILE SPRINT — Transfer Timing Assistant")
    print(f"  📍  Stop: {stop_name}  |  🚶 Pace: {pace.upper()}")
    print("=" * 65)

    # Fetch upcoming departures
    try:
        departures = get_upcoming_departures(stop_name)
    except ValueError as e:
        print(f"\n  ❌ Error: {e}")
        sys.exit(1)

    if not departures:
        print("\n  No upcoming departures found.")
        sys.exit(0)

    # Process each departure
    for i, dep in enumerate(departures, 1):
        vehicle_name = dep["name"]
        platform = dep["platform"]
        departure_time = dep["departure_time"]
        sim_distance = dep["walking_distance_m"]

        # Get walking distance (API with fallback)
        distance_info = get_walking_distance(
            origin_stop=f"{stop_name} Bus Station, Bengaluru",
            destination_platform=f"{platform}, {stop_name}, Bengaluru",
            fallback_distance_m=sim_distance,
        )
        distance_m = distance_info["distance_m"]

        # Calculate walk time and buffer
        walk_time_s = calculate_walk_time(distance_m, pace)
        buffer_s = get_time_buffer(departure_time, walk_time_s)

        # Get Gemini verdict
        verdict = get_transfer_verdict(
            stop_name=stop_name,
            vehicle_name=vehicle_name,
            buffer_seconds=buffer_s,
            walk_time_seconds=walk_time_s,
            distance_meters=distance_m,
        )

        # Format and print output
        time_str = departure_time.strftime("%H:%M:%S")
        buffer_display = f"{buffer_s:+.0f}s"
        source_tag = f"[{distance_info['source']}]" if distance_info["source"] != "api" else ""

        print(f"\n  ── Departure {i} {'─' * 45}")
        print(f"  🚍  Vehicle   : {vehicle_name}")
        print(f"  🔢  Platform  : {platform}")
        print(f"  🕐  Departs   : {time_str}")
        print(f"  📏  Distance  : {distance_m:.0f}m {source_tag}")
        print(f"  ⏱️   Walk Time : {walk_time_s:.0f}s ({pace})")
        print(f"  ⏳  Buffer    : {buffer_display}")
        print(f"  🤖  Verdict   : {verdict}")

    print(f"\n{'=' * 65}")
    print(f"  ✅  Analysis complete. Stay on schedule!")
    print(f"{'=' * 65}\n")


if __name__ == "__main__":
    main()
