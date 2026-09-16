"""Tests for Piper TTS Audio Module."""

import asyncio
import os
import sys

# Ensure ai-engine root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import ASGITransport, AsyncClient
from app.core.config import settings
from app.main import app


async def run_tts_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Voices Catalog Endpoint
        print("Checking /api/v1/audio/voices endpoint...")
        resp_voices = await client.get("/api/v1/audio/voices")
        assert resp_voices.status_code == 200, f"Expected 200, got {resp_voices.status_code}"
        voices = resp_voices.json()
        assert len(voices) >= 3, f"Expected at least 3 voices, got {len(voices)}"
        voice_names = [v["name"] for v in voices]
        assert "en_US-lessac-medium" in voice_names
        print("PASS: /api/v1/audio/voices catalog verified [OK]")

        # 2. Test Authorization on /api/v1/audio/tts
        print("Testing authorization guard on /api/v1/audio/tts...")
        resp_unauth = await client.post(
            "/api/v1/audio/tts",
            json={"text": "Hello"},
            headers={"X-Internal-Secret": "wrong_key"},
        )
        assert resp_unauth.status_code == 403, f"Expected 403, got {resp_unauth.status_code}"
        print("PASS: Unauthorized access correctly rejected with 403 [OK]")

        # 3. Test Speech Synthesis with auto-download
        print("Testing TTS synthesis with 'en_US-lessac-medium' (may download model on first run)...")
        resp_tts = await client.post(
            "/api/v1/audio/tts",
            json={
                "text": "Welcome to President University English Placement Test.",
                "voice": "en_US-lessac-medium",
                "speed": 1.0,
            },
            headers={"X-Internal-Secret": settings.INTERNAL_API_KEY},
            timeout=180.0,
        )
        assert resp_tts.status_code == 200, f"Expected 200, got {resp_tts.status_code}: {resp_tts.text}"
        assert resp_tts.headers.get("content-type") == "audio/wav"

        audio_bytes = resp_tts.content
        assert len(audio_bytes) > 5000, f"WAV file too small: {len(audio_bytes)} bytes"

        # Check standard WAV RIFF header
        assert audio_bytes[:4] == b"RIFF", f"Invalid WAV header: {audio_bytes[:4]}"
        assert audio_bytes[8:12] == b"WAVE", f"Invalid WAV format: {audio_bytes[8:12]}"

        print(f"PASS: Speech synthesized successfully! ({len(audio_bytes)} bytes of WAV audio) [OK]")

    print("\nALL AUDIO TTS TESTS COMPLETED SUCCESSFULLY! [OK]")


if __name__ == "__main__":
    asyncio.run(run_tts_tests())
