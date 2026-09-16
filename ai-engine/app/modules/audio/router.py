from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import verify_internal_api_key
from app.modules.audio.schemas import TTSRequest, VoiceInfo
from app.modules.audio.service import list_available_voices, synthesize_speech

router = APIRouter()


@router.get(
    "/voices",
    response_model=List[VoiceInfo],
    summary="List Available TTS Voices",
    description="Get all supported Piper TTS voices and check which ones are downloaded locally.",
)
async def get_voices() -> List[VoiceInfo]:
    """Return catalog of supported Piper voices."""
    return list_available_voices()


@router.post(
    "/tts",
    summary="Synthesize Text to Speech",
    description="Synthesize given text into high-quality WAV audio using local Piper TTS.",
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
    """Generate spoken WAV audio from text."""
    try:
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
