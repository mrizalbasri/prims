"""Tests for AI Question and Quiz Generator Module."""

import asyncio
import base64
import os
import sys

# Ensure ai-engine root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import ASGITransport, AsyncClient
from app.core.config import settings
from app.main import app


async def run_question_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Sections Endpoint
        print("Checking /api/v1/questions/sections endpoint...")
        resp_sections = await client.get("/api/v1/questions/sections")
        assert resp_sections.status_code == 200, f"Expected 200, got {resp_sections.status_code}"
        sections_data = resp_sections.json()
        assert "sections" in sections_data
        assert "difficultyLevels" in sections_data
        section_types = [s["type"] for s in sections_data["sections"]]
        assert "VOCABULARY" in section_types
        assert "GRAMMAR" in section_types
        assert "READING" in section_types
        assert "LISTENING" in section_types
        print("PASS: /api/v1/questions/sections catalog verified [OK]")

        # 2. Test Authorization Guard
        print("Testing authorization guard on /api/v1/questions/generate...")
        resp_unauth = await client.post(
            "/api/v1/questions/generate",
            json={"sectionType": "GRAMMAR", "count": 2},
            headers={"X-Internal-Secret": "wrong_key"},
        )
        assert resp_unauth.status_code == 403, f"Expected 403, got {resp_unauth.status_code}"
        print("PASS: Unauthorized question generation correctly rejected with 403 [OK]")

        # 3. Test Grammar Question Generation
        print("Generating 3 GRAMMAR questions...")
        resp_grammar = await client.post(
            "/api/v1/questions/generate",
            json={
                "sectionType": "GRAMMAR",
                "difficulty": "INTERMEDIATE",
                "count": 3,
                "topic": "Academic Research & University Life",
            },
            headers={"X-Internal-Secret": settings.INTERNAL_API_KEY},
            timeout=60.0,
        )
        assert resp_grammar.status_code == 200, f"Expected 200, got {resp_grammar.status_code}: {resp_grammar.text}"
        grammar_data = resp_grammar.json()
        assert grammar_data["sectionType"] == "GRAMMAR"
        assert len(grammar_data["questions"]) >= 2
        for q in grammar_data["questions"]:
            assert len(q["options"]) == 4, f"Each question must have 4 options: {q}"
            assert q["correctAnswer"] in q["options"], f"correctAnswer must be in options: {q}"
            assert len(q["explanation"]) > 0, "Explanation must not be empty"
        print(f"PASS: Generated {len(grammar_data['questions'])} validated Grammar questions [OK]")

        # 4. Test Reading Question Generation (with passage)
        print("Generating 2 READING questions with passage...")
        resp_reading = await client.post(
            "/api/v1/questions/generate",
            json={
                "sectionType": "READING",
                "difficulty": "ADVANCED",
                "count": 2,
                "topic": "Artificial Intelligence in Higher Education",
            },
            headers={"X-Internal-Secret": settings.INTERNAL_API_KEY},
            timeout=60.0,
        )
        assert resp_reading.status_code == 200
        reading_data = resp_reading.json()
        assert reading_data["readingPassage"] is not None
        assert len(reading_data["readingPassage"]) > 50
        assert len(reading_data["questions"]) >= 1
        print("PASS: Generated Reading passage and comprehension questions [OK]")

        # 5. Test Listening Question Generation with Auto-Piper TTS
        print("Generating 2 LISTENING questions with auto-synthesized Piper TTS audio...")
        resp_listening = await client.post(
            "/api/v1/questions/generate",
            json={
                "sectionType": "LISTENING",
                "difficulty": "INTERMEDIATE",
                "count": 2,
                "topic": "President University Library Services",
                "generateAudio": True,
            },
            headers={"X-Internal-Secret": settings.INTERNAL_API_KEY},
            timeout=120.0,
        )
        assert resp_listening.status_code == 200
        listening_data = resp_listening.json()
        assert listening_data["audioScript"] is not None
        assert listening_data["audioBase64"] is not None, "audioBase64 must be populated when generateAudio=True"

        # Verify decoded audio is a valid WAV
        decoded_wav = base64.b64decode(listening_data["audioBase64"])
        assert decoded_wav[:4] == b"RIFF", "Invalid WAV header on generated listening audio"
        assert len(decoded_wav) > 10000, f"Listening audio unexpectedly small: {len(decoded_wav)} bytes"
        print(f"PASS: Generated Listening questions + Piper TTS audio ({len(decoded_wav)} bytes WAV) [OK]")

    print("\nALL QUESTION GENERATOR TESTS COMPLETED SUCCESSFULLY! [OK]")


if __name__ == "__main__":
    asyncio.run(run_question_tests())
