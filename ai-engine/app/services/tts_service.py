import io
import logging
import wave
from pathlib import Path
from typing import Dict, List, Optional
import httpx
from piper import PiperVoice
from piper.config import SynthesisConfig

logger = logging.getLogger("prism_ai_engine.tts")

# Directory where Piper ONNX models and config JSON files are cached
MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models" / "piper"

# Voice catalog metadata and download sources
VOICE_CATALOG: Dict[str, Dict[str, str]] = {
    "en_US-lessac-medium": {
        "name": "en_US-lessac-medium",
        "language": "en_US",
        "gender": "female",
        "quality": "medium",
        "description": "Clear American English female voice, ideal for listening comprehension",
        "base_url": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium",
    },
    "en_US-ryan-medium": {
        "name": "en_US-ryan-medium",
        "language": "en_US",
        "gender": "male",
        "quality": "medium",
        "description": "Natural American English male voice",
        "base_url": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium",
    },
    "en_GB-alan-medium": {
        "name": "en_GB-alan-medium",
        "language": "en_GB",
        "gender": "male",
        "quality": "medium",
        "description": "British English male voice for UK accent comprehension",
        "base_url": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium",
    },
}

DEFAULT_VOICE = "en_US-lessac-medium"

# In-memory singleton cache of loaded PiperVoice instances
_loaded_voices: Dict[str, PiperVoice] = {}


def list_available_voices() -> List[Dict[str, str]]:
    """Return catalog of supported voices and their download status."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for voice_id, meta in VOICE_CATALOG.items():
        model_file = MODELS_DIR / f"{voice_id}.onnx"
        is_downloaded = model_file.exists() and model_file.stat().st_size > 0
        results.append({
            **meta,
            "is_downloaded": is_downloaded,
        })
    return results


async def ensure_voice_downloaded(voice_name: str) -> tuple[Path, Path]:
    """Ensure the voice model .onnx and .onnx.json files exist locally, downloading if necessary."""
    if voice_name not in VOICE_CATALOG:
        raise ValueError(f"Unsupported voice: {voice_name}. Choose from: {list(VOICE_CATALOG.keys())}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / f"{voice_name}.onnx"
    config_path = MODELS_DIR / f"{voice_name}.onnx.json"

    if model_path.exists() and config_path.exists():
        if model_path.stat().st_size > 0 and config_path.stat().st_size > 0:
            return model_path, config_path

    voice_meta = VOICE_CATALOG[voice_name]
    base_url = voice_meta["base_url"]
    onnx_url = f"{base_url}/{voice_name}.onnx"
    json_url = f"{base_url}/{voice_name}.onnx.json"

    logger.info("Downloading Piper voice model '%s' from %s...", voice_name, base_url)

    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        # 1. Download .onnx.json config
        logger.info("Downloading config for %s...", voice_name)
        r_json = await client.get(json_url)
        r_json.raise_for_status()
        config_path.write_bytes(r_json.content)

        # 2. Download .onnx model with streaming
        logger.info("Downloading ONNX model weights for %s...", voice_name)
        async with client.stream("GET", onnx_url) as stream_resp:
            stream_resp.raise_for_status()
            with open(model_path, "wb") as f:
                async for chunk in stream_resp.aiter_bytes(chunk_size=65536):
                    f.write(chunk)

    logger.info("Successfully downloaded Piper voice model '%s'", voice_name)
    return model_path, config_path


async def get_or_load_voice(voice_name: str) -> PiperVoice:
    """Retrieve cached PiperVoice or load it from disk."""
    if voice_name in _loaded_voices:
        return _loaded_voices[voice_name]

    model_path, config_path = await ensure_voice_downloaded(voice_name)
    logger.info("Loading Piper ONNX model into memory from %s...", model_path)
    voice = PiperVoice.load(model_path=model_path, config_path=config_path, use_cuda=False)
    _loaded_voices[voice_name] = voice
    return voice


async def synthesize_speech(
    text: str,
    voice_name: Optional[str] = None,
    length_scale: float = 1.0,
) -> bytes:
    """
    Synthesize text into WAV audio bytes using Piper TTS.
    length_scale > 1.0 makes speech slower, < 1.0 makes it faster.
    """
    clean_text = text.strip()
    if not clean_text:
        raise ValueError("Text cannot be empty")

    selected_voice = voice_name or DEFAULT_VOICE
    voice = await get_or_load_voice(selected_voice)

    syn_config = SynthesisConfig(length_scale=length_scale) if length_scale != 1.0 else None

    # Synthesize directly into an in-memory WAV buffer
    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wav_file:
        voice.synthesize_wav(clean_text, wav_file, syn_config=syn_config)

    wav_bytes = wav_io.getvalue()
    logger.info("Synthesized %d characters into %d bytes of WAV audio", len(clean_text), len(wav_bytes))
    return wav_bytes
