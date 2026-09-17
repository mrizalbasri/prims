from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SectionType(str, Enum):
    VOCABULARY = "VOCABULARY"
    GRAMMAR = "GRAMMAR"
    READING = "READING"
    LISTENING = "LISTENING"


class DifficultyLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


class QuestionItem(BaseModel):
    """A standardized multiple-choice question item."""
    questionText: str = Field(..., min_length=3, description="The question text or prompt")
    options: List[str] = Field(..., min_length=4, max_length=4, description="Exactly 4 distinct multiple-choice options")
    correctAnswer: str = Field(..., description="The correct answer matching one of the options")
    explanation: str = Field(..., description="Explanation in Indonesian for why this option is correct")

    @field_validator("correctAnswer")
    @classmethod
    def validate_correct_answer(cls, v: str, info) -> str:
        options = info.data.get("options")
        if options and v not in options:
            raise ValueError(f"correctAnswer '{v}' must be one of the provided options: {options}")
        return v


class QuestionGenerateRequest(BaseModel):
    """Request payload for generating academic English questions."""
    sectionType: SectionType = Field(..., description="Type of section: VOCABULARY, GRAMMAR, READING, or LISTENING")
    difficulty: str = Field(default="INTERMEDIATE", description="Difficulty level or CEFR target (e.g. BEGINNER, INTERMEDIATE, ADVANCED, B1, B2)")
    count: int = Field(default=5, ge=1, le=15, description="Number of questions to generate (1-15)")
    topic: Optional[str] = Field(default=None, max_length=200, description="Specific academic or conversational topic (e.g. 'Campus Life', 'Environmental Science')")
    generateAudio: bool = Field(default=False, description="For LISTENING section: automatically synthesize speech using Piper TTS")
    voice: Optional[str] = Field(default=None, description="Piper voice identifier for listening audio")
    speed: float = Field(default=1.0, ge=0.5, le=2.0, description="Playback speed rate for listening audio")


class QuestionGenerateResponse(BaseModel):
    """Response containing generated questions and optional reading passage / audio."""
    sectionType: SectionType
    difficulty: str
    readingPassage: Optional[str] = Field(default=None, description="Long text passage for READING questions")
    audioScript: Optional[str] = Field(default=None, description="Transcript of the audio passage for LISTENING questions")
    audioBase64: Optional[str] = Field(default=None, description="Base64-encoded WAV audio data if generateAudio is True")
    questions: List[QuestionItem]
    totalQuestions: int
