from typing import Optional
from pydantic import BaseModel, Field

DEFAULT_VOICE = "en_US-lessac-medium"


class TTSRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Text to convert into spoken audio",
        example="Welcome to President University English Placement Test.",
    )
    voice: Optional[str] = Field(
        default=DEFAULT_VOICE,
        description="Identifier of the Piper TTS voice model",
        example=DEFAULT_VOICE,
    )
    speed: float = Field(
        default=1.0,
        ge=0.5,
        le=2.0,
        description="Speech speed rate multiplier (1.0 = normal, 0.8 = slower, 1.2 = faster)",
    )


class VoiceInfo(BaseModel):
    name: str
    language: str
    gender: str
    quality: str
    description: str
    is_downloaded: bool
