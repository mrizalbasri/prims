from pydantic import BaseModel, Field
from app.core.config import settings


class HealthCheckResponse(BaseModel):
    status: str = Field(default="ok", example="ok")
    app_name: str = Field(default=settings.PROJECT_NAME)
    version: str = Field(default=settings.VERSION)
    environment: str = Field(default=settings.ENVIRONMENT)
    uptime_seconds: float = Field(..., description="Server uptime in seconds")
    timestamp: str = Field(..., description="Current ISO 8601 UTC timestamp")
