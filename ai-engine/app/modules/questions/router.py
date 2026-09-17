from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import verify_internal_api_key
from app.modules.questions.schemas import (
    DifficultyLevel,
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    SectionType,
)
from app.modules.questions.service import generate_questions_package

router = APIRouter()


@router.get(
    "/sections",
    summary="List Supported Question Sections",
    description="Get supported English test sections and difficulty levels for question generation.",
)
async def get_sections() -> Dict[str, Any]:
    """Return available sections and difficulty options."""
    return {
        "sections": [
            {
                "type": SectionType.VOCABULARY.value,
                "title": "Vocabulary & Word Choice",
                "description": "Tests academic vocabulary, contextual meaning, and collocations.",
            },
            {
                "type": SectionType.GRAMMAR.value,
                "title": "Grammar & Structure",
                "description": "Tests syntactic accuracy, tenses, conditionals, and sentence mechanics.",
            },
            {
                "type": SectionType.READING.value,
                "title": "Reading Comprehension",
                "description": "Generates an academic passage with paired comprehension questions.",
            },
            {
                "type": SectionType.LISTENING.value,
                "title": "Listening Comprehension",
                "description": "Generates audio script monologue/dialogue and optional Piper TTS audio.",
            },
        ],
        "difficultyLevels": [level.value for level in DifficultyLevel],
    }


@router.post(
    "/generate",
    response_model=QuestionGenerateResponse,
    summary="Generate Academic Questions",
    description="Generate a validated package of university-level English placement test questions using AI.",
)
async def generate_questions(
    payload: QuestionGenerateRequest,
    _authorized: bool = Depends(verify_internal_api_key),
) -> QuestionGenerateResponse:
    """Generate multiple-choice questions for university English assessment."""
    try:
        response = await generate_questions_package(payload)
        return response
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question generation failed: {str(err)}",
        )
