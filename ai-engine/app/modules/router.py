from fastapi import APIRouter
from app.modules.health.router import router as health_router
from app.modules.audio.router import router as audio_router

api_v1_router = APIRouter()

# Register modular routers
api_v1_router.include_router(health_router, tags=["Health"])
api_v1_router.include_router(audio_router, prefix="/audio", tags=["Audio & TTS (Piper)"])

# Future feature modules will be added here:
# from app.modules.questions.router import router as questions_router
# api_v1_router.include_router(questions_router, prefix="/questions", tags=["Questions"])
# from app.modules.ppt.router import router as ppt_router
# api_v1_router.include_router(ppt_router, prefix="/ppt", tags=["Presentation"])
