"""
Test scenarios for Last-Mile Sprint transfer verdicts.

Tests 3 key scenarios using the local verdict engine directly
(no external API mocking required):

1. Comfortable window (buffer > 120s) → WALK
2. Tight window (buffer 10-60s)       → SPRINT or WALK BRISKLY
3. Missed connection (buffer < 0)     → WAIT FOR NEXT
"""

import unittest

from src.gemini_agent import get_transfer_verdict


class TestTransferVerdicts(unittest.TestCase):
    """Test that the local verdict engine returns correct verdicts."""

    def test_comfortable_window_returns_walk(self):
        """
        Scenario: Buffer > 120 seconds — commuter has plenty of time.
        Expected: Verdict should start with 'WALK'.
        """
        verdict = get_transfer_verdict(
            stop_name="Majestic",
            vehicle_name="Bus 500D - Electronic City",
            buffer_seconds=180,
            walk_time_seconds=240,
            distance_meters=350,
        )

        self.assertIn("WALK", verdict)
        self.assertNotIn("WALK BRISKLY", verdict)
        self.assertNotIn("SPRINT", verdict)
        self.assertNotIn("WAIT FOR NEXT", verdict)

    def test_tight_window_returns_sprint_or_brisk(self):
        """
        Scenario: Buffer between 10 and 60 seconds — cutting it close.
        Expected: Verdict should contain 'SPRINT' or 'WALK BRISKLY'.
        """
        verdict = get_transfer_verdict(
            stop_name="Silk Board",
            vehicle_name="Bus 500C - Majestic",
            buffer_seconds=25,
            walk_time_seconds=155,
            distance_meters=180,
        )

        self.assertTrue(
            "SPRINT" in verdict or "WALK BRISKLY" in verdict,
            f"Expected 'SPRINT' or 'WALK BRISKLY' in verdict, got: {verdict}",
        )

    def test_missed_connection_returns_wait(self):
        """
        Scenario: Buffer < 0 — the vehicle has already departed.
        Expected: Verdict should contain 'WAIT FOR NEXT'.
        """
        verdict = get_transfer_verdict(
            stop_name="KR Puram",
            vehicle_name="Metro Purple Line - Whitefield",
            buffer_seconds=-45,
            walk_time_seconds=120,
            distance_meters=150,
        )

        self.assertIn("WAIT FOR NEXT", verdict)


if __name__ == "__main__":
    unittest.main()
