import time
from datetime import datetime, timezone
from fastapi import APIRouter, status
from pydantic import BaseModel, Field
from app.core.config import settings

router = APIRouter()
START_TIME = time.time()


class HealthCheckResponse(BaseModel):
    status: str = Field(default="ok", example="ok")
    app_name: str = Field(default=settings.PROJECT_NAME)
    version: str = Field(default=settings.VERSION)
    environment: str = Field(default=settings.ENVIRONMENT)
    uptime_seconds: float = Field(..., description="Server uptime in seconds")
    timestamp: str = Field(..., description="Current ISO 8601 UTC timestamp")


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check the operational health and uptime of the PRISM AI Engine.",
)
async def health_check() -> HealthCheckResponse:
    """Return health status and uptime metrics."""
    now_iso = datetime.now(timezone.utc).isoformat()
    uptime = round(time.time() - START_TIME, 2)

    return HealthCheckResponse(
        status="ok",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        uptime_seconds=uptime,
        timestamp=now_iso,
    )
