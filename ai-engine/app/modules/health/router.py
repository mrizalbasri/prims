import time
from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.core.config import settings
from app.modules.health.schemas import HealthCheckResponse

router = APIRouter()
START_TIME = time.time()


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
