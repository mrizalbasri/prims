from fastapi import APIRouter
from app.api.v1.endpoints import health

api_v1_router = APIRouter()

# Register core health router
api_v1_router.include_router(health.router, tags=["Health"])

# Future routers will be registered here cleanly:
# api_v1_router.include_router(audio.router, prefix="/audio", tags=["Audio"])
# api_v1_router.include_router(questions.router, prefix="/questions", tags=["Questions"])
# api_v1_router.include_router(ppt.router, prefix="/ppt", tags=["PPT"])
