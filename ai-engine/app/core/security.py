from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import settings

api_key_header = APIKeyHeader(name="X-Internal-Secret", auto_error=False)


async def verify_internal_api_key(
    api_key: str = Security(api_key_header),
) -> bool:
    """Validate internal API key for communication between Next.js and AI Engine."""
    # Allow bypass in local development if explicitly configured
    if not settings.INTERNAL_API_KEY:
        return True

    if not api_key or api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or missing internal API key",
        )
    return True
