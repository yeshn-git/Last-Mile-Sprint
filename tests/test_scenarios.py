"""
Test scenarios for Last-Mile Sprint transfer verdicts.

Tests 3 key scenarios by mocking the Gemini API:
1. Comfortable window (buffer > 120s) → WALK
2. Tight window (buffer 10-60s) → SPRINT or WALK BRISKLY
3. Missed connection (buffer < 0) → WAIT FOR NEXT
"""

import unittest
from unittest.mock import patch, MagicMock


class TestTransferVerdicts(unittest.TestCase):
    """Test that Gemini verdicts match expected outcomes for different buffer windows."""

    @patch("src.gemini_agent._client")
    def test_comfortable_window_returns_walk(self, mock_client):
        """
        Scenario: Buffer > 120 seconds — commuter has plenty of time.
        Expected: Verdict should contain 'WALK'.
        """
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = "WALK — You have a comfortable 180-second buffer to reach the platform at a relaxed pace."
        mock_client.models.generate_content.return_value = mock_response

        from src.gemini_agent import get_transfer_verdict

        verdict = get_transfer_verdict(
            stop_name="Majestic",
            vehicle_name="Bus 500D - Electronic City",
            buffer_seconds=180,
            walk_time_seconds=240,
            distance_meters=350,
        )

        self.assertIn("WALK", verdict)
        mock_client.models.generate_content.assert_called_once()

    @patch("src.gemini_agent._client")
    def test_tight_window_returns_sprint_or_brisk(self, mock_client):
        """
        Scenario: Buffer between 10 and 60 seconds — cutting it close.
        Expected: Verdict should contain 'SPRINT' or 'WALK BRISKLY'.
        """
        mock_response = MagicMock()
        mock_response.text = "SPRINT — With only 25 seconds of buffer, you need to run to make it to Bay 3."
        mock_client.models.generate_content.return_value = mock_response

        from src.gemini_agent import get_transfer_verdict

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
        mock_client.models.generate_content.assert_called_once()

    @patch("src.gemini_agent._client")
    def test_missed_connection_returns_wait(self, mock_client):
        """
        Scenario: Buffer < 0 — the vehicle has already departed.
        Expected: Verdict should contain 'WAIT FOR NEXT'.
        """
        mock_response = MagicMock()
        mock_response.text = "WAIT FOR NEXT — The buffer is -45 seconds, meaning you have already missed this departure."
        mock_client.models.generate_content.return_value = mock_response

        from src.gemini_agent import get_transfer_verdict

        verdict = get_transfer_verdict(
            stop_name="KR Puram",
            vehicle_name="Metro Purple Line - Whitefield",
            buffer_seconds=-45,
            walk_time_seconds=120,
            distance_meters=150,
        )

        self.assertIn("WAIT FOR NEXT", verdict)
        mock_client.models.generate_content.assert_called_once()


if __name__ == "__main__":
    unittest.main()
