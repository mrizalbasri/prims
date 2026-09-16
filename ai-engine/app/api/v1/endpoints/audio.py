from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from app.core.security import verify_internal_api_key
from app.services.tts_service import (
    DEFAULT_VOICE,
    VOICE_CATALOG,
    list_available_voices,
    synthesize_speech,
)

router = APIRouter()


class TTSRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Text to convert into speech",
        example="Welcome to President University English Placement Test.",
    )
    voice: Optional[str] = Field(
        default=DEFAULT_VOICE,
        description="Identifier of the Piper TTS voice model to use",
        example=DEFAULT_VOICE,
    )
    speed: float = Field(
        default=1.0,
        ge=0.5,
        le=2.0,
        description="Speech speed rate (1.0 = normal, 0.8 = slower, 1.2 = faster)",
    )


class VoiceInfo(BaseModel):
    name: str
    language: str
    gender: str
    quality: str
    description: str
    is_downloaded: bool


@router.get(
    "/voices",
    response_model=List[VoiceInfo],
    summary="List Available TTS Voices",
    description="Get all supported Piper TTS voices and check which ones are downloaded locally.",
)
async def get_voices() -> List[VoiceInfo]:
    """Return available Piper voices."""
    return list_available_voices()


@router.post(
    "/tts",
    summary="Synthesize Text to Speech",
    description="Synthesize given text into high-quality WAV audio using Piper TTS.",
    responses={
        200: {
            "content": {"audio/wav": {}},
            "description": "Returns raw WAV audio stream.",
        }
    },
)
async def text_to_speech(
    payload: TTSRequest,
    _authorized: bool = Depends(verify_internal_api_key),
) -> Response:
    """Generate speech audio from text."""
    try:
        # Piper's length_scale: 1.0 / speed (speed 1.2 -> length_scale 0.833 = faster)
        length_scale = round(1.0 / payload.speed, 3)

        wav_bytes = await synthesize_speech(
            text=payload.text,
            voice_name=payload.voice,
            length_scale=length_scale,
        )

        return Response(
            content=wav_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "inline; filename=speech.wav",
                "Content-Type": "audio/wav",
                "Cache-Control": "public, max-age=86400",
            },
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis failed: {str(err)}",
        )
