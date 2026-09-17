import base64
import json
import logging
import re
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.modules.audio.service import synthesize_speech
from app.modules.questions.schemas import (
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    QuestionItem,
    SectionType,
)

logger = logging.getLogger("prism_ai_engine.questions")


def _clean_json_text(text: str) -> str:
    """Extract and clean raw JSON string from LLM output."""
    cleaned = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()
    return cleaned


def _build_prompt(request: QuestionGenerateRequest) -> str:
    """Construct a rigorous prompt for university-level English placement test questions."""
    count = request.count
    diff = request.difficulty
    topic = request.topic or "University Academic Life, Science & Technology, or Global Culture"

    if request.sectionType == SectionType.VOCABULARY:
        instructions = f"""
Generate exactly {count} multiple-choice English vocabulary questions appropriate for university level at difficulty: {diff}.
Topic/Context: {topic}.
Questions should test contextual word choice, academic collocations, or precise meaning based on the Academic Word List (AWL).

For each question:
- questionText: A clear sentence with a blank or an underlined word to test.
- options: Exactly 4 distinct choices.
- correctAnswer: The correct choice (must match one option verbatim).
- explanation: A clear explanation in Bahasa Indonesia explaining the word meaning and why the choice is correct.

JSON format to return:
{{
  "questions": [
    {{
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }}
  ]
}}
"""
    elif request.sectionType == SectionType.GRAMMAR:
        instructions = f"""
Generate exactly {count} multiple-choice English grammar and sentence structure questions appropriate for university level at difficulty: {diff}.
Topic/Context: {topic}.
Focus on: tenses, subject-verb agreement, conditionals, relative clauses, passive voice, or parallel structure.

For each question:
- questionText: A sentence with a blank or structural challenge.
- options: Exactly 4 distinct choices.
- correctAnswer: The correct choice (must match one option verbatim).
- explanation: A clear explanation in Bahasa Indonesia explaining the grammatical rule and why the choice is correct.

JSON format to return:
{{
  "questions": [
    {{
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }}
  ]
}}
"""
    elif request.sectionType == SectionType.READING:
        instructions = f"""
First, write an academic reading passage of about 150-250 words about: '{topic}'.
Difficulty level: {diff}.
Then, generate exactly {count} multiple-choice comprehension questions based directly on the passage.
Questions should test: main idea, specific details, inferences, and vocabulary in context.

For each question:
- questionText: The comprehension question.
- options: Exactly 4 distinct choices.
- correctAnswer: The correct choice (must match one option verbatim).
- explanation: A clear explanation in Bahasa Indonesia referencing the relevant part of the passage.

JSON format to return:
{{
  "readingPassage": "<The complete reading passage text>",
  "questions": [
    {{
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }}
  ]
}}
"""
    else:  # LISTENING
        instructions = f"""
First, write a natural monologue or academic dialogue script (100-180 words) suitable for an oral listening comprehension test.
Topic: '{topic}'.
Difficulty level: {diff}.
Then, generate exactly {count} multiple-choice listening comprehension questions based on the spoken script.

For each question:
- questionText: The question based on what was spoken in the audio.
- options: Exactly 4 distinct choices.
- correctAnswer: The correct choice (must match one option verbatim).
- explanation: A clear explanation in Bahasa Indonesia explaining why the answer is correct based on the audio script.

JSON format to return:
{{
  "audioScript": "<The spoken transcript text>",
  "questions": [
    {{
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }}
  ]
}}
"""

    return f"""You are an elite English language assessment specialist designing an official university placement test.
You MUST output ONLY valid, parsable JSON matching the requested structure. Do not output any introductory or concluding text outside the JSON block.

{instructions}
"""


async def _call_llm(prompt: str) -> str:
    """Call active LLM provider (Gemini or MiniMax) using async httpx."""
    # 1. Check Gemini
    if settings.GEMINI_API_KEY:
        if settings.GEMINI_BASE_URL:
            # Custom proxy / OpenAI-compatible
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    f"{settings.GEMINI_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GEMINI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GEMINI_MODEL,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    },
                )
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]
        else:
            # Official Google Generative Language REST endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "responseMimeType": "application/json",
                            "temperature": 0.2,
                        },
                    },
                )
                res.raise_for_status()
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]

    # 2. Check MiniMax
    if settings.MINIMAX_API_KEY:
        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(
                f"{settings.MINIMAX_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.MINIMAX_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.MINIMAX_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                },
            )
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"]

    raise ValueError("No LLM API keys configured (GEMINI_API_KEY or MINIMAX_API_KEY required)")


def _generate_fallback_template(request: QuestionGenerateRequest) -> Dict[str, Any]:
    """Provide verified fallback questions when offline or when no API keys are provided."""
    count = min(request.count, 5)
    fallback_map = {
        SectionType.VOCABULARY: {
            "questions": [
                {
                    "questionText": "The professor asked students to compile a ______ bibliography of sources cited in their research.",
                    "options": ["comprehensive", "fragile", "reluctant", "hostile"],
                    "correctAnswer": "comprehensive",
                    "explanation": "'Comprehensive' berarti lengkap dan menyeluruh, sesuai dengan konteks daftar pustaka akademik.",
                },
                {
                    "questionText": "Despite several challenges, the university committee decided to ______ with the proposed academic reforms.",
                    "options": ["proceed", "hesitate", "withdraw", "postpone"],
                    "correctAnswer": "proceed",
                    "explanation": "'Proceed' berarti melanjutkan atau meneruskan tindakan.",
                },
                {
                    "questionText": "Her argument was so ______ that even her opponents conceded the point.",
                    "options": ["persuasive", "ambiguous", "trivial", "reckless"],
                    "correctAnswer": "persuasive",
                    "explanation": "'Persuasive' berarti meyakinkan dan logis sehingga lawan debat menyetujuinya.",
                },
                {
                    "questionText": "The new laboratory equipment will significantly ______ the department's research capabilities.",
                    "options": ["enhance", "diminish", "jeopardize", "disregard"],
                    "correctAnswer": "enhance",
                    "explanation": "'Enhance' berarti meningkatkan kualitas atau kapabilitas.",
                },
                {
                    "questionText": "Students are expected to maintain an ______ stance when evaluating conflicting scientific theories.",
                    "options": ["objective", "emotional", "irrational", "impulsive"],
                    "correctAnswer": "objective",
                    "explanation": "'Objective' berarti tidak memihak dan berlandaskan fakta ilmiah.",
                },
            ][:count]
        },
        SectionType.GRAMMAR: {
            "questions": [
                {
                    "questionText": "If the committee ______ the proposal earlier, the funds would have been allocated by now.",
                    "options": ["had reviewed", "reviewed", "reviews", "would review"],
                    "correctAnswer": "had reviewed",
                    "explanation": "Kondisional tipe 3 (past unreal) membutuhkan bentuk past perfect 'had reviewed' pada if-clause.",
                },
                {
                    "questionText": "Neither the department head nor the lecturers ______ present at yesterday's curriculum symposium.",
                    "options": ["were", "was", "is", "be"],
                    "correctAnswer": "were",
                    "explanation": "Aturan subjek-kata kerja 'neither... nor...': kata kerja menyesuaikan subjek terdekat yaitu 'the lecturers' (jamak -> were).",
                },
                {
                    "questionText": "By the end of this semester, the students ______ their final research presentations.",
                    "options": ["will have completed", "completed", "have completed", "completing"],
                    "correctAnswer": "will have completed",
                    "explanation": "Penanda waktu 'By the end of...' memerlukan bentuk Future Perfect 'will have completed'.",
                },
                {
                    "questionText": "Rarely ______ such dedication to academic excellence in first-year undergraduates.",
                    "options": ["have we witnessed", "we have witnessed", "we witnessed", "witnessed we"],
                    "correctAnswer": "have we witnessed",
                    "explanation": "Inversi negatif: kalimat diawali kata negatif 'Rarely' harus diikuti struktur inversi (auxiliary + subject).",
                },
                {
                    "questionText": "The dean insisted that each student ______ the academic code of conduct before enrollment.",
                    "options": ["read", "reads", "is reading", "has read"],
                    "correctAnswer": "read",
                    "explanation": "Subjunctive mood setelah kata kerja 'insisted that' membutuhkan bentuk base verb (read).",
                },
            ][:count]
        },
        SectionType.READING: {
            "readingPassage": "Artificial intelligence is reshaping contemporary university education by offering individualized learning trajectories. In multilingual campuses, automated language assessment tools provide immediate diagnostics on vocabulary richness and syntactic accuracy. Rather than replacing human educators, these technologies assist faculty in identifying common conceptual gaps and developing targeted pedagogical interventions. Consequently, learners receive frequent feedback while educators allocate more time to high-order mentoring and critical inquiry.",
            "questions": [
                {
                    "questionText": "What is the primary benefit of automated language assessment mentioned in the passage?",
                    "options": [
                        "Providing immediate diagnostics on vocabulary and syntax",
                        "Completely replacing human professors in classes",
                        "Eliminating the necessity for university homework",
                        "Limiting student collaboration in seminars",
                    ],
                    "correctAnswer": "Providing immediate diagnostics on vocabulary and syntax",
                    "explanation": "Paragraf menyebutkan secara eksplisit bahwa AI memberikan 'immediate diagnostics on vocabulary richness and syntactic accuracy'.",
                },
                {
                    "questionText": "According to the passage, how do automated tools affect educators' time?",
                    "options": [
                        "They allow educators to spend more time on mentoring and critical inquiry",
                        "They force professors to grade more paper essays manually",
                        "They decrease the total hours spent on academic research",
                        "They require faculty to spend all day programming",
                    ],
                    "correctAnswer": "They allow educators to spend more time on mentoring and critical inquiry",
                    "explanation": "Paragraf menyatakan bahwa teknologi ini membantu dosen mengalokasikan lebih banyak waktu untuk 'high-order mentoring and critical inquiry'.",
                },
                {
                    "questionText": "The word 'pedagogical' in the passage is closest in meaning to:",
                    "options": ["instructional", "financial", "technological", "traditional"],
                    "correctAnswer": "instructional",
                    "explanation": "'Pedagogical' berkaitan dengan metode pengajaran atau pendidikan (instructional).",
                },
            ][:count]
        },
        SectionType.LISTENING: {
            "audioScript": "Good morning, incoming students, and welcome to President University. Today, we will introduce the academic resource center located on the second floor of the main library. The center offers one-on-one English writing tutorials, speaking clinics, and quiet research pods. Please remember that tutorial sessions must be reserved online at least twenty-four hours in advance.",
            "questions": [
                {
                    "questionText": "Where is the academic resource center located?",
                    "options": [
                        "On the second floor of the main library",
                        "Next to the student cafeteria",
                        "Inside the administration building",
                        "Behind the sports gymnasium",
                    ],
                    "correctAnswer": "On the second floor of the main library",
                    "explanation": "Audio menyatakan bahwa pusat bimbingan berada di lantai dua perpustakaan utama ('second floor of the main library').",
                },
                {
                    "questionText": "How far in advance must tutorial sessions be booked?",
                    "options": [
                        "At least twenty-four hours in advance",
                        "At least one week in advance",
                        "On the morning of the session",
                        "Two hours beforehand",
                    ],
                    "correctAnswer": "At least twenty-four hours in advance",
                    "explanation": "Pembicara menegaskan bahwa sesi harus dipesan setidaknya 24 jam sebelumnya ('at least twenty-four hours in advance').",
                },
                {
                    "questionText": "What service is explicitly mentioned as available at the center?",
                    "options": [
                        "Speaking clinics and writing tutorials",
                        "Free textbook printing and binding",
                        "Flight reservation services",
                        "Vehicle parking registration",
                    ],
                    "correctAnswer": "Speaking clinics and writing tutorials",
                    "explanation": "Audio menyebutkan 'one-on-one English writing tutorials and speaking clinics'.",
                },
            ][:count]
        },
    }

    return fallback_map.get(request.sectionType, {"questions": []})


async def generate_questions_package(request: QuestionGenerateRequest) -> QuestionGenerateResponse:
    """Generate a validated questions package using AI with optional Piper TTS audio."""
    logger.info(
        "Generating %d %s questions at difficulty %s (topic: %s)...",
        request.count,
        request.sectionType.value,
        request.difficulty,
        request.topic,
    )

    parsed_json: Dict[str, Any] = {}

    # Try LLM generation if keys exist
    if settings.GEMINI_API_KEY or settings.MINIMAX_API_KEY:
        try:
            prompt = _build_prompt(request)
            raw_output = await _call_llm(prompt)
            clean_json = _clean_json_text(raw_output)
            parsed_json = json.loads(clean_json)
        except Exception as err:
            logger.warning("LLM question generation encountered error: %s. Using academic fallback template.", err)
            parsed_json = _generate_fallback_template(request)
    else:
        logger.info("No LLM API keys configured. Using validated academic template.")
        parsed_json = _generate_fallback_template(request)

    # Validate questions list with Pydantic
    raw_questions = parsed_json.get("questions", [])
    validated_questions: List[QuestionItem] = []

    for item in raw_questions:
        try:
            q = QuestionItem(
                questionText=item.get("questionText", ""),
                options=item.get("options", []),
                correctAnswer=item.get("correctAnswer", ""),
                explanation=item.get("explanation", ""),
            )
            validated_questions.append(q)
        except Exception as val_err:
            logger.warning("Skipping invalid question item: %s", val_err)

    if not validated_questions:
        fallback = _generate_fallback_template(request)
        for item in fallback.get("questions", []):
            validated_questions.append(QuestionItem(**item))

    reading_passage = parsed_json.get("readingPassage")
    audio_script = parsed_json.get("audioScript")
    audio_base64: Optional[str] = None

    # Handle automatic Piper TTS audio generation for LISTENING questions
    if request.sectionType == SectionType.LISTENING and request.generateAudio and audio_script:
        try:
            logger.info("Auto-synthesizing Piper TTS audio for listening script (%d chars)...", len(audio_script))
            speed = request.speed or 1.0
            length_scale = round(1.0 / speed, 3)
            wav_bytes = await synthesize_speech(
                text=audio_script,
                voice_name=request.voice,
                length_scale=length_scale,
            )
            audio_base64 = base64.b64encode(wav_bytes).decode("ascii")
            logger.info("Generated %d bytes of listening audio (base64 encoded)", len(wav_bytes))
        except Exception as audio_err:
            logger.error("Failed to generate Piper TTS audio for listening test: %s", audio_err)

    return QuestionGenerateResponse(
        sectionType=request.sectionType,
        difficulty=request.difficulty,
        readingPassage=reading_passage,
        audioScript=audio_script,
        audioBase64=audio_base64,
        questions=validated_questions,
        totalQuestions=len(validated_questions),
    )
